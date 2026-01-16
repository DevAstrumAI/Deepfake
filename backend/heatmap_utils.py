"""
Standalone heatmap visualization utilities without PyTorch dependencies
Used for OpenAI-based detection results
"""

import numpy as np
import cv2
from typing import Optional

def apply_colormap(heatmap: np.ndarray, colormap_name: str = 'jet', threshold: float = 0.5, binary: bool = True) -> np.ndarray:
    """
    Apply colormap to heatmap with explicit deepfake/real visualization
    
    Args:
        heatmap: Grayscale heatmap (H, W) normalized to 0-1
        colormap_name: Matplotlib colormap name (ignored if binary=True)
        threshold: Threshold for binary classification (0.5 = middle)
        binary: If True, use explicit red/blue binary visualization
    
    Returns:
        Colored heatmap (H, W, 3) in RGB format
    """
    # Normalize to 0-1 if needed
    if heatmap.max() > 1.0 or heatmap.min() < 0.0:
        if heatmap.max() > heatmap.min():
            heatmap = (heatmap - heatmap.min()) / (heatmap.max() - heatmap.min())
        else:
            heatmap = np.zeros_like(heatmap)
    
    if binary:
        # Create explicit binary visualization
        # Red = Deepfake detected (high values >= threshold)
        # Blue = Real (low values < threshold)
        colored = np.zeros((heatmap.shape[0], heatmap.shape[1], 3), dtype=np.uint8)
        
        # Use adaptive threshold based on heatmap distribution
        heatmap_flat = heatmap.flatten()
        if len(heatmap_flat) > 0 and np.max(heatmap_flat) > 0:
            # Use 70th percentile as threshold to ensure we show some red regions
            adaptive_threshold = np.percentile(heatmap_flat, 70)
            if adaptive_threshold < 0.2:
                actual_threshold = 0.2
            else:
                actual_threshold = min(adaptive_threshold, 0.5)
        else:
            actual_threshold = 0.2
        
        # Threshold the heatmap
        deepfake_mask = heatmap >= actual_threshold
        real_mask = heatmap < actual_threshold
        
        # For deepfake areas: Red with intensity based on how far above threshold
        if np.any(deepfake_mask):
            deepfake_intensity = np.clip((heatmap[deepfake_mask] - actual_threshold) / (1.0 - actual_threshold + 1e-8), 0, 1)
            colored[deepfake_mask, 0] = 255  # Red channel
            colored[deepfake_mask, 1] = (255 * (1 - deepfake_intensity)).astype(np.uint8)  # Green (fade to red)
            colored[deepfake_mask, 2] = (255 * (1 - deepfake_intensity)).astype(np.uint8)  # Blue (fade to red)
        
        # For real areas: Blue with intensity based on how far below threshold
        if np.any(real_mask):
            real_intensity = np.clip((actual_threshold - heatmap[real_mask]) / (actual_threshold + 1e-8), 0, 1)
            colored[real_mask, 0] = (255 * (1 - real_intensity)).astype(np.uint8)  # Red (fade to blue)
            colored[real_mask, 1] = (255 * (1 - real_intensity)).astype(np.uint8)  # Green (fade to blue)
            colored[real_mask, 2] = 255  # Blue channel
        
        return colored
    else:
        # Use OpenCV colormap (no torch needed)
        heatmap_uint8 = (heatmap * 255).astype(np.uint8)
        colored = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
        colored = cv2.cvtColor(colored, cv2.COLOR_BGR2RGB)
        return colored

def overlay_heatmap(image: np.ndarray, heatmap: np.ndarray, alpha: float = 0.4, threshold: float = 0.5, binary: bool = True) -> np.ndarray:
    """
    Overlay heatmap on image with explicit deepfake/real visualization
    
    Args:
        image: Original image (H, W, 3) in RGB format
        heatmap: Heatmap (H, W) normalized to 0-1 or (H, W, 3)
        alpha: Blending factor (0.0 = only image, 1.0 = only heatmap)
        threshold: Threshold for binary classification
        binary: If True, use explicit red/blue binary visualization
    
    Returns:
        Overlaid image (H, W, 3) in RGB format
    """
    # Convert heatmap to colored if needed
    if heatmap.ndim == 2:
        heatmap_colored = apply_colormap(heatmap, threshold=threshold, binary=binary)
    else:
        if heatmap.max() <= 1.0:
            heatmap_colored = (heatmap * 255).astype(np.uint8)
        else:
            heatmap_colored = heatmap.astype(np.uint8)
    
    # Resize heatmap to match image size with maximum precision
    if heatmap_colored.shape[:2] != image.shape[:2]:
        heatmap_colored = cv2.resize(
            heatmap_colored, 
            (image.shape[1], image.shape[0]),
            interpolation=cv2.INTER_LANCZOS4
        )
    
    # Blend images
    blend_alpha = min(1.0, max(0.0, alpha))
    overlaid = cv2.addWeighted(image, 1 - blend_alpha, heatmap_colored, blend_alpha, 0)
    
    return overlaid

