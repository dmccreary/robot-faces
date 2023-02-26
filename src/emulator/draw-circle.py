import plotly.graph_objs as go
import numpy as np

def draw_binary_grid(grid, circle_center=None, circle_radius=None):
    """
    Draw a binary grid using Plotly.

    Args:
        grid (numpy.ndarray): A 2D binary numpy array with shape (128, 64).
        circle_center (tuple): Optional tuple of the form (x, y) representing the center of the circle on the grid.
        circle_radius (float): Optional float representing the radius of the circle in pixels.

    Returns:
        fig (plotly.graph_objs.Figure): A Plotly figure of the binary grid.
    """

    assert grid.shape == (128, 64), "Grid should be a 2D binary numpy array with shape (128, 64)."
    
    # Create the Plotly figure object
    fig = go.Figure()
    
    # Set up the layout
    fig.update_layout(
        width=800,
        height=400,
        xaxis=dict(
            range=[0, 128],
            showgrid=False,
            ticks='',
            showticklabels=False
        ),
        yaxis=dict(
            range=[0, 64],
            showgrid=False,
            ticks='',
            showticklabels=False
        )
    )
    
    # Create the binary grid
    x, y = np.meshgrid(np.arange(128), np.arange(64))
    x, y = x.flatten(), y.flatten()
    
    if circle_center is None:
        z = grid.flatten()
    else:
        assert circle_radius is not None, "circle_radius should be specified if circle_center is specified."
        d = np.linalg.norm(np.vstack([x - circle_center[0], y - circle_center[1]]), axis=0)
        z = np.where(d <= circle_radius, 1, 0)
    
    # Add the binary grid as a scatter plot
    fig.add_trace(go.Scatter(
        x=x,
        y=y,
        mode='markers',
        marker=dict(
            size=10,
            color=z,
            colorscale=[[0, 'white'], [1, 'blue']],
            showscale=False
        )
    ))
    
    return fig

# Create a binary grid with a circle
circle_center = (64, 32)
circle_radius = 20
grid = np.zeros((128, 64))
fig = draw_binary_grid(grid, circle_center=(32,32), circle_radius=10)
# fig = draw_binary_grid(grid, circle_center=(96,32), circle_radius=12)

# Display the Plotly figure
fig.show()
