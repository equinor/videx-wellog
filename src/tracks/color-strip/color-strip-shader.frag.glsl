#version 300 es
precision highp float;

in vec2 v_uv;

uniform vec2 u_domain;
uniform int u_entryCount;
uniform sampler2D u_dataTexture;

out vec4 outColor;

// Converts UV y-coordinate to depth
float uvToDepth() {
    return v_uv.y * (u_domain.y - u_domain.x) + u_domain.x;
}

// Gets the full entry (depth, rgb) at the given row
vec4 getEntryAtRow(int rowIndex) {
    return texelFetch(u_dataTexture, ivec2(0, rowIndex), 0);
}

void main() {
    // Convert UV.y to depth space
    float targetDepth = uvToDepth();

    // Check if outside the global range and discard early
    float minDepth = getEntryAtRow(0).a;
    float maxDepth = getEntryAtRow(u_entryCount - 1).a;
    if (targetDepth < minDepth || targetDepth > maxDepth) {
      discard;
    }

    // Binary search
    int low = 0;
    int high = u_entryCount - 1;
    int matchIndex = 0;

    while (low <= high) {
        int mid = (low + high) / 2;
        float midDepth = getEntryAtRow(mid).a;

        if (targetDepth < midDepth) {
            matchIndex = mid;
            high = mid - 1;
        } else {
            low = mid + 1;
        }
    }

    vec4 entry = getEntryAtRow(matchIndex);
    outColor = vec4(entry.rgb, 1.0);
}
