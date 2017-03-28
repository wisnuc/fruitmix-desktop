# Structure

```
PhotoApp {
  this.renderLeftNav()
  PhotoToolBar
  PhotoList{
    ScrollFlush{
      LazyloadBox{
        PhotoListByDate.jsx{
          PhotoItem{
            HoverIconButton  
          }
          PhotoSelectDate
            SelectIconButton  
        }
      }
    },
    this.renderPhotoDetail(
      PhotoDetail{
        SlideToAnimate  
      }
    ),
    this.renderCarousel(
      FadingToAnimate{
        Carousel{
          CarouselTopBar  
          CarouselBottomBar
          CarouselList
          SlideToAnimate
        }
      }
    )
  }
}

```
