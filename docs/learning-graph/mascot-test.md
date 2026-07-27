---
title: Pixel Rendering Test
description: This test page shows all mascot images as well as the admonition styles for our pedagogical agent Pixel
image: img/mascot/welcome.png
og:image: img/mascot/welcome.png
---
# Pixel - Mascot Test

This page shows all mascot images as well as the admonition styles for reference. Check that all the images have a transparent background
and do not have excessive padding around the drawing.
Note that the images have a dashed blue border around them so you can clearly see the padding.

<style type="text/css">
  img {
    border: 1px dashed blue;
  }
</style>



## Admonition Tests


!!! mascot-neutral "A Note from Pixel"
    ![Pixel notes](../img/mascot/neutral.png){ class="mascot-admonition-img" }
    Here is a friendly note from Pixel.

!!! mascot-welcome "Pixel Welcomes You!"
    ![Pixel welcomes you](../img/mascot/welcome.png){ class="mascot-admonition-img" }
    Welcome, friend!

!!! mascot-thinking "Pixel Key Insight"
    ![Pixel is thinking](../img/mascot/thinking.png){ class="mascot-admonition-img" }
    Let's think this through together!

!!! mascot-tip "Pixel's Tip"
    ![Pixel shares a tip](../img/mascot/tip.png){ class="mascot-admonition-img" }
    Here is a helpful suggestion.

!!! mascot-warning "Pixel Gentle Warning of Common Mistake"
    ![Pixel warns you](../img/mascot/warning.png){ class="mascot-admonition-img" }
    Watch out for this one!  It can be tricky!

!!! mascot-encourage "You've Got This!"
    ![Pixel encourages you](../img/mascot/encouraging.png){ class="mascot-admonition-img" }
    You can do it!  I have faith in you!

!!! mascot-celebration "Excellent Work!"
    ![Pixel celebrates](../img/mascot/celebration.png){ class="mascot-admonition-img" }
    Congratulations!  You made it!


## Image Padding Tests

Verify that there is no excessive padding around the images.
If there is, run the Python script that removes the extra padding.

<div class="grid cards" markdown>
1. Welcome
![](../img/mascot/welcome.png){ width="150px"}
2. Thinking
![](../img/mascot/thinking.png){ width="150px"}
3. Tip
![](../img/mascot/tip.png){ width="150px"}
4. Warning
![](../img/mascot/warning.png){ width="150px"}
5. Encouraging
![](../img/mascot/encouraging.png){ width="150px"}
6. Celebration
![](../img/mascot/celebration.png){ width="150px"}
7. Neutral
![](../img/mascot/neutral.png){ width="150px"}
</div>
