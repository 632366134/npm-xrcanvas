// 模版三对联动画数据
export const generateTemplate3KeyFrame = (scale) => {
  return {
    keyframe: {
      animate: {
        0: {
          scale: [0, 0, 0]
        },
        5: {
          scale: [scale[0], scale[2], scale[1]]
        },
        100: {
          scale: [scale[0], scale[2], scale[1]]
        }
      }
    },
    animation: {
      animate: {
        keyframe: 'animate',
        delay: 0,
        duration: 10,
        ease: 'linear',
        loop: -1,
      }
    }
  }
}