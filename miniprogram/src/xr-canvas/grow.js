// 生成生长效果帧动画数据KeyFrame
export const generateGrowKeyFrame = (scale, delay, duration) => {
  return {
    keyframe: {
      grow: {
        0: {
          scale: [0, 0, 0]
        },
        100: {
          scale: scale,
        }
      }
    },
    animation: {
      grow: {
        keyframe: 'grow',
        delay: delay,
        duration: duration,
        ease: 'linear',
        loop: 0,
      }
    }
  }
}