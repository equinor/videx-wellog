#version 300 es
precision mediump float;

in vec2 a_position;

out vec2 v_uv;

void main() {
    // Map a_position from [-1, 1] to [0, 1]
    // Invert y-position to align with canvas
    v_uv = vec2(a_position.x, -a_position.y) * 0.5 + 0.5;

    gl_Position = vec4(a_position, 0.0, 1.0);
}
