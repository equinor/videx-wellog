#version 300 es
precision highp float;

in vec2 v_uv;

uniform vec2 u_domain;

uniform int u_componentCount;
uniform vec3 u_componentColors[32];

// Diagonal-hatch color per component and a flag (>= 0.5) marking which
// components should be rendered with a hatch pattern.
uniform vec3 u_componentPatternColors[32];
uniform float u_componentIsPattern[32];

uniform int u_entryCount;

// x: interpolationType (0: Linear, 1: Nearest, 2: Discrete, 3: Next)
// y: discreteHeight
uniform vec2 u_interpolationConfig;

uniform sampler2D u_dataTexture;

out vec4 outColor;

// Spacing (in device pixels) of the diagonal hatch lines.
const float HATCH_SPACING = 8.0;
// Width (in device pixels) of each diagonal hatch line.
const float HATCH_LINE_WIDTH = 2.0;

// Converts UV y-coordinate to depth
float uvToDepth() {
    return v_uv.y * (u_domain.y - u_domain.x) + u_domain.x;
}

bool isOutsideDiscreteDistance(float dist) {
  // Calculate a dynamic threshold based on the domain range
  float domainRange = u_domain.y - u_domain.x;
  float adaptiveThreshold = domainRange * u_interpolationConfig.y;

  // True, if the distance is outside adaptive threshold
  return (dist > adaptiveThreshold);
}

// Returns 1.0 on a diagonal hatch line, 0.0 otherwise. Uses gl_FragCoord so
// the spacing stays constant in screen space regardless of zoom level.
float diagonalHatch() {
    float diagonal = gl_FragCoord.x - gl_FragCoord.y;
    return step(mod(diagonal, HATCH_SPACING), HATCH_LINE_WIDTH);
}

// Gets the depth value at the given row
float getDepthAtEntry(float depthSampleX, float sampleY) {
    vec2 texCoord = vec2(
        depthSampleX,
        sampleY
    );
    return texture(u_dataTexture, texCoord).r;
}

// Gets the cumulative component percentage
float getCumulativeAt(int component, float depth, float textureWidth) {
    vec2 texCoord = vec2(
        (float(component) + 0.5) / textureWidth,
        depth
    );
    return texture(u_dataTexture, texCoord).r;
}

void main() {
    // Convert UV.y to depth space
    float targetDepth = uvToDepth();

    float textureWidth = float(u_componentCount) + 1.0;
    float textureHeight = float(u_entryCount);

    float depthSampleX = 0.5 / textureWidth;

    // Check if outside the global range and discard early
    float minDepth = getDepthAtEntry(depthSampleX, 0.5 / textureHeight);
    float maxDepth = getDepthAtEntry(depthSampleX, (float(u_entryCount) - 0.5) / textureHeight);

    int interpolationType = int(u_interpolationConfig.x);

    // For discrete track we "suck" in outside pixels that should be drawn
    if (interpolationType == 2) {
        // If outside the global range, check adaptive threshold
        if (targetDepth < minDepth) {
            float depthDist = minDepth - targetDepth;
            if (isOutsideDiscreteDistance(depthDist)) {
                discard;
            }
            // Clamp to nearest edge
            targetDepth = minDepth;
        }
        else if (targetDepth > maxDepth) {
            float depthDist = targetDepth - maxDepth;
            if (isOutsideDiscreteDistance(depthDist)) {
                discard;
            }
            // Clamp to nearest edge
            targetDepth = maxDepth;
        }
    } else { // Non-Discrete: Discard if outside range
        if (targetDepth < minDepth || targetDepth > maxDepth) {
            discard;
        }
    }

    // Binary search
    float toSampleY = -1.0;
    float fromSampleY = -1.0;
    int low = 0;
    int high = u_entryCount - 1;
    float toDepth, fromDepth;

    while (low <= high) {
        int midBack = (low + high) / 2;
        int midFront = midBack + 1;

        float backSampleY = (float(midBack) + 0.5) / textureHeight;
        float frontSampleY = (float(midFront) + 0.5) / textureHeight;

        float backDepth = getDepthAtEntry(depthSampleX, backSampleY);
        float frontDepth = getDepthAtEntry(depthSampleX, frontSampleY);

        // Check if targetDepth lies within this interval
        if (targetDepth >= backDepth && targetDepth <= frontDepth) {
            fromSampleY = backSampleY;
            toSampleY = frontSampleY;
            fromDepth = backDepth;
            toDepth = frontDepth;
            break;
        }

        // Narrow scope
        if (targetDepth < backDepth) {
            high = midBack - 1;
        } else {
            low = midFront;
        }
    }

    // Calculate interpolation factor (0.0 to 1.0)
    float t = (targetDepth - fromDepth) / (toDepth - fromDepth);

    // Discard pixels outside of adaptive threshold
    if (interpolationType == 2) {
      float depthDist = min(abs(toDepth - targetDepth), abs(targetDepth - fromDepth));
      if (isOutsideDiscreteDistance(depthDist)) {
          discard;
      }
    }

    // Iterate over components
    for (int x = 1; x <= u_componentCount; x++) {
        // Get cumulative value of right edge of given component
        float cumulativeValue;
        if (interpolationType == 0) { // Linear
          float cumulativeFrom = getCumulativeAt(x, fromSampleY, textureWidth);
          float cumulativeTo = getCumulativeAt(x, toSampleY, textureWidth);
          cumulativeValue = mix(cumulativeFrom, cumulativeTo, t);
        } else if (interpolationType == 3) { // Next
            cumulativeValue = getCumulativeAt(x, toSampleY, textureWidth);
        } else { // Nearest & Discrete
            float sampleY = (t < 0.5) ? fromSampleY : toSampleY;
            cumulativeValue = getCumulativeAt(x, sampleY, textureWidth);
        }

        // If uv.x is less than the cumulative value, this is the component
        if (v_uv.x < cumulativeValue) {
            vec3 baseColor = u_componentColors[x - 1];

            // Apply diagonal hatch for components flagged as patterned
            if (u_componentIsPattern[x - 1] >= 0.5) {
                vec3 patternColor = u_componentPatternColors[x - 1];
                float hatch = diagonalHatch();
                outColor = vec4(mix(baseColor, patternColor, hatch), 1.0);
            } else {
                outColor = vec4(baseColor, 1.0);
            }
            return;
        }
    }

    // Should not happen
    discard;
}
