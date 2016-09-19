/**
  图片预加载
**/

export function preload (imgPaths, timeout) {
  Array.isArray(imgPaths) || (imgPaths = imgPaths.split(','));

  let imgList = imgPaths.slice();
  let loadedCount = 0;
  let length = imgList.length;
  let timer;

  function loadImg (imgPath, imgIndex, callback) {
    const imgObj = new Image();
    imgObj.src = imgPath;

    if (imgObj.complete) {
      imgList[imgIndex] = imgObj;
      loadedCount++;

      callback();
    } else {
      // 加载是否超时
      (idx => {
        timer = setTimeout(() => {
          clearTimeout(timer);
          imgObj.onload = imgObj.onerror = null;
          imgList[idx] = new Error('加载超时');
          loadedCount++;

          callback();
        }, timeout);
      })(imgIndex);

      // 加载成功
      (idx => {
        imgObj.onload = function () {
          clearTimeout(timer);
          imgObj.onload = null;
          imgList[idx] = this;
          loadedCount++;

          callback();
        }
      })(imgIndex);

      // 加载失败
      (idx => {
        imgObj.onerror = function () {
          clearTimeout(timer);
          imgObj.onerror = null;
          imgList[idx] = new Error('加载失败');
          loadedCount++;

          callback();
        }
      })(imgIndex);
    }
  }

  return new Promise(resolve => {
    imgList.forEach((imgPath, index) => {
      loadImg(imgPath, index, () => {

        // 如果所有图片加载完成
        if (loadedCount === length) {
          resolve(imgList);
        }
      });
    });
  });
}
