# Structure

```
PhotoApp {
  this.renderLeftNav()
  PhotoToolBar
  PhotoList{
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


PhotoListByDate.jsx{
  PhotoItem{
    HoverIconButton  
  }
  PhotoSelectDate
  SelectIconButton  
}

```
