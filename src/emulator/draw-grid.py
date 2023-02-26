import plotly.graph_objs as go
import numpy as np

def draw_binary_grid(grid):
    """
    Draw a binary grid using Plotly.

    Args:
        grid (numpy.ndarray): A 2D binary numpy array with shape (128, 64).

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
    z = grid.flatten()
    
    # Add the binary grid as a scatter plot
    fig.add_trace(go.Scatter(
        x=x,
        y=y,
        mode='markers',
        marker=dict(
            size=10,
            color=z,
            colorscale=[[0, 'white'], [1, 'black']],
            showscale=False
        )
    ))
    
    return fig

import numpy as np

# Create a random binary grid
grid = np.random.randint(0, 2, size=(128, 64))

# Draw the binary grid using Plotly
fig = draw_binary_grid(grid)

# Display the Plotly figure
fig.show()

