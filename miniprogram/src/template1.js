// 自上而下波浪效果帧动画
export const generateTemplate1KeyFrame = (scale, index, delay, duration) => {
  let defaultScale = [scale[0], scale[2], scale[1]];
  let largeScale = [scale[0] + scale[0] * 0.1, scale[2] + 0.1, scale[1] + scale[1] * 0.1];
  let keyframe = {
    0: {
      scale: defaultScale
    },
    [index * 10 + 10]: {
      scale: defaultScale
    },
    [index * 10 + 30]: {
      scale: largeScale
    },
    [index * 10 + 50]: {
      scale: defaultScale,
    },
    100: {
      scale: defaultScale,
    }
  }
  return {
    keyframe: {
      animate: keyframe
    },
    animation: {
      animate: {
        keyframe: 'animate',
        delay: delay,
        duration: duration,
        ease: 'ease-in-out',
        loop: -1
      }
    }
  }
}