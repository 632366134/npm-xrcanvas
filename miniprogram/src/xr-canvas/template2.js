      
// 模版二动画数据
export const generateTemplate2KeyFrame = (scale) => {
    return {
      keyframe: {
        animate: {
          0: {
            scale: [0, scale[2], 0]
          },
          22: {
            scale: [0, scale[2], 0]
          },
          25: {
            scale: [scale[0], scale[2], scale[1]]
          },
          100: {
            scale: [scale[0], scale[2], scale[1]]
          },
        }
      },
      animation: {
        animate: {
          keyframe: 'animate',
          delay: 0,
          duration: 25,
          ease: 'linear',
          loop: -1,
        }
      }
    }
  }
  
      