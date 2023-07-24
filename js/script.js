'use strict'
;(function () {
  let userAgent = navigator.userAgent.toLowerCase(),
    isIE =
      userAgent.indexOf('msie') !== -1
        ? parseInt(userAgent.split('msie')[1], 10)
        : userAgent.indexOf('trident') !== -1
        ? 11
        : userAgent.indexOf('edge') !== -1
        ? 12
        : false

  // Unsupported browsers
  if (isIE !== false && isIE < 12) {
    console.warn('[Core] detected IE' + isIE + ', load alert')
    var script = document.createElement('script')
    script.src = './js/support.js'
    document.querySelector('head').appendChild(script)
  }

  let initialDate = new Date(),
    $document = $(document),
    $window = $(window),
    $html = $('html'),
    isDesktop = $html.hasClass('desktop'),
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isTouch = 'ontouchstart' in window,
    onloadCaptchaCallback,
    windowReady = false,
    isNoviBuilder = false,
    plugins = {
      pointerEvents: isIE < 11 ? 'js/pointer-events.min.js' : false,
      bootstrapTooltip: $('[data-bs-toggle="tooltip"]'),
      bootstrapTabs: $('.tabs-custom'),
      bootstrapCards: $('.card-group-custom'),
      materialParallax: $('.parallax-container'),
      rdNavbar: $('.rd-navbar'),
      owl: $('.owl-carousel'),
      preloader: $('.preloader'),
      swiper: $('.swiper-slider'),
      search: $('.rd-search'),
      searchResults: $('.rd-search-results'),
      isotope: $('.isotope-wrap'),
      customToggle: $('[data-custom-toggle]'),
      fixedHeight: $('[data-fixed-height]'),
      twitterfeed: $('.twitter'),
      slick: $('.slick-slider'),
      d3Charts: $('.d3-chart'),
      lightGallery: $('[data-lightgallery="group"]'),
      lightGalleryItem: $('[data-lightgallery="item"]'),
      lightDynamicGalleryItem: $('[data-lightgallery="dynamic"]'),
      scroller: $('.scroll-wrap'),
      copyrightYear: $('.copyright-year'),
      maps: $('.google-map-container'),

      captcha: $('.recaptcha'),
      checkbox: $('input[type="checkbox"]'),
      rdMailForm: $('.rd-mailform'),
      rdInputLabel: $('.form-label'),
      regula: $('[data-constraints]'),
      radio: $('input[type="radio"]'),
      page: $('.page'),

      counter: document.querySelectorAll('.counter'),
      progressLinear: document.querySelectorAll('.progress-linear'),
      progressCircle: document.querySelectorAll('.progress-circle'),
      countdown: document.querySelectorAll('.countdown')
    }

  /**
   * @desc Check the element was been scrolled into the view
   * @param {object} elem - jQuery object
   * @return {boolean}
   */
  function isScrolledIntoView(elem) {
    if (isNoviBuilder) return true
    return (
      elem.offset().top + elem.outerHeight() >= $window.scrollTop() &&
      elem.offset().top <= $window.scrollTop() + $window.height()
    )
  }

  /**
   * @desc Calls a function when element has been scrolled into the view
   * @param {object} element - jQuery object
   * @param {function} func - init function
   */
  function lazyInit(element, func) {
    let scrollHandler = function () {
      if (!element.hasClass('lazy-loaded') && isScrolledIntoView(element)) {
        func.call(element)
        element.addClass('lazy-loaded')
      }
    }

    scrollHandler()
    $window.on('scroll', scrollHandler)
  }

  // Initialize scripts that require a loaded window
  $window.on('load', function () {
    // Page loader & Page transition
    if (plugins.preloader.length && !isNoviBuilder) {
      plugins.preloader.addClass("loaded");
      plugins.page.removeClass("fadeOut");

      // pageTransition({
      //   target: document.querySelector('.page'),
      //   delay: 0,
      //   duration: 500,
      //   classIn: 'fadeIn',
      //   classOut: 'fadeOut',
      //   classActive: 'animated',
      //   conditions: function (event, link) {
      //     return (
      //       link &&
      //       !/(\#|javascript:void\(0\)|callto:|tel:|mailto:|:\/\/)/.test(link) &&
      //       !event.currentTarget.hasAttribute('data-lightgallery') &&
      //       !event.currentTarget.matches('[target="_blank"]')
      //     )
      //   },
      //   onTransitionStart: function (options) {
      //     plugins.preloader.removeClass("loaded");
      //     plugins.page.removeClass("fadeOut");

      //     // setTimeout(function () {
      //     //   // 开启loading
      //     // }, options.duration * 0.15)
      //   },
      //   onReady: function () {
      //     // 隐藏loading
      //     plugins.preloader.addClass('loaded')
      //     plugins.page.removeClass("fadeOut");
      //     windowReady = true
      //   }
      // })
    }

    // Counter
    if (plugins.counter) {
      for (let i = 0; i < plugins.counter.length; i++) {
        let node = plugins.counter[i],
          counter = aCounter({
            node: node,
            formatter: function (value) {
              if (value < 10) {
                return '0' + value
              } else {
                return value
              }
            },
            duration: node.getAttribute('data-duration') || 1000
          }),
          scrollHandler = function () {
            if (Util.inViewport(this) && !this.classList.contains('animated-first')) {
              this.counter.run()
              this.classList.add('animated-first')
            }
          }.bind(node),
          blurHandler = function () {
            this.counter.params.to = parseInt(this.textContent, 10)
            this.counter.run()
          }.bind(node)

        if (isNoviBuilder) {
          node.counter.run()
          node.addEventListener('blur', blurHandler)
        } else {
          scrollHandler()
          window.addEventListener('scroll', scrollHandler)
        }
      }
    }

    // Progress Bar
    if (plugins.progressLinear) {
      for (let i = 0; i < plugins.progressLinear.length; i++) {
        let container = plugins.progressLinear[i],
          counter = aCounter({
            node: container.querySelector('.progress-linear-counter'),
            duration: container.getAttribute('data-duration') || 1000,
            onStart: function () {
              this.custom.bar.style.width = this.params.to + '%'
            }
          })

        counter.custom = {
          container: container,
          bar: container.querySelector('.progress-linear-bar'),
          onScroll: function () {
            if (
              (Util.inViewport(this.custom.container) && !this.custom.container.classList.contains('animated')) ||
              isNoviBuilder
            ) {
              this.run()
              this.custom.container.classList.add('animated')
            }
          }.bind(counter),
          onBlur: function () {
            this.params.to = parseInt(this.params.node.textContent, 10)
            this.run()
          }.bind(counter)
        }

        if (isNoviBuilder) {
          counter.run()
          counter.params.node.addEventListener('blur', counter.custom.onBlur)
        } else {
          counter.custom.onScroll()
          document.addEventListener('scroll', counter.custom.onScroll)
        }
      }
    }

    // Progress Circle
    if (plugins.progressCircle) {
      for (let i = 0; i < plugins.progressCircle.length; i++) {
        let container = plugins.progressCircle[i],
          counter = aCounter({
            node: container.querySelector('.progress-circle-counter'),
            duration: 500,
            onUpdate: function (value) {
              this.custom.bar.render(value * 3.6)
            }
          })

        counter.params.onComplete = counter.params.onUpdate

        counter.custom = {
          container: container,
          bar: aProgressCircle({
            node: container.querySelector('.progress-circle-bar')
          }),
          onScroll: function () {
            if (Util.inViewport(this.custom.container) && !this.custom.container.classList.contains('animated')) {
              this.run()
              this.custom.container.classList.add('animated')
            }
          }.bind(counter),
          onBlur: function () {
            this.params.to = parseInt(this.params.node.textContent, 10)
            this.run()
          }.bind(counter)
        }

        if (isNoviBuilder) {
          counter.run()
          counter.params.node.addEventListener('blur', counter.custom.onBlur)
        } else {
          counter.custom.onScroll()
          window.addEventListener('scroll', counter.custom.onScroll)
        }
      }
    }

    // Isotope
    if (plugins.isotope.length) {
      console.log(plugins.isotope)
      for (let i = 0; i < plugins.isotope.length; i++) {
        let wrap = plugins.isotope[i],
          filterHandler = function (event) {
            event.preventDefault()
            for (let n = 0; n < this.isoGroup.filters.length; n++) this.isoGroup.filters[n].classList.remove('active')
            this.classList.add('active')
            this.isoGroup.isotope.arrange({
              filter:
                this.getAttribute('data-isotope-filter') !== '*'
                  ? '[data-filter*="' + this.getAttribute('data-isotope-filter') + '"]'
                  : '*'
            })
          },
          resizeHandler = function () {
            this.isoGroup.isotope.layout()
          }

        wrap.isoGroup = {}
        wrap.isoGroup.filters = wrap.querySelectorAll('[data-isotope-filter]')
        wrap.isoGroup.node = wrap.querySelector('.isotope')
        wrap.isoGroup.layout = wrap.isoGroup.node.getAttribute('data-isotope-layout')
          ? wrap.isoGroup.node.getAttribute('data-isotope-layout')
          : 'masonry'
        wrap.isoGroup.isotope = new Isotope(wrap.isoGroup.node, {
          itemSelector: '.isotope-item',
          layoutMode: wrap.isoGroup.layout,
          filter: wrap.isoGroup.node.hasAttribute('data-isotope-filter-active')
            ? '[data-filter*="' + wrap.isoGroup.node.getAttribute('data-isotope-filter-active') + '"]'
            : '*',
          columnWidth: (function () {
            if (wrap.isoGroup.node.hasAttribute('data-column-class'))
              return wrap.isoGroup.node.getAttribute('data-column-class')
            if (wrap.isoGroup.node.hasAttribute('data-column-width'))
              return parseFloat(wrap.isoGroup.node.getAttribute('data-column-width'))
          })()
        })

        for (let n = 0; n < wrap.isoGroup.filters.length; n++) {
          let filter = wrap.isoGroup.filters[n]
          filter.isoGroup = wrap.isoGroup
          filter.addEventListener('click', filterHandler)
        }

        window.addEventListener('resize', resizeHandler.bind(wrap))

        if (!isIE) {
          let imgs = document.querySelectorAll('img[loading="lazy"]')
          for (let i = 0; i < imgs.length; i++) {
            let img = imgs[i]
            img.addEventListener('load', function (e) {
              window.dispatchEvent(new Event('resize'))
            })
          }
        }
      }
    }

    // Material Parallax
    if (plugins.materialParallax.length) {
      if (!isNoviBuilder && !isIE && !isMobile) {
        plugins.materialParallax.parallax()
      } else {
        for (let i = 0; i < plugins.materialParallax.length; i++) {
          let $parallax = $(plugins.materialParallax[i])

          $parallax.addClass('parallax-disabled')
          $parallax.css({
            'background-image': 'url(' + $parallax.data('parallax-img') + ')'
          })
        }
      }
    }
  })

  // Initialize scripts that require a finished document
  $(function () {
    var isNoviBuilder = window.xMode

    /**
     * Wrapper to eliminate json errors
     * @param {string} str - JSON string
     * @returns {object} - parsed or empty object
     */
    function parseJSON(str) {
      try {
        if (str) return JSON.parse(str)
        else return {}
      } catch (error) {
        console.warn(error)
        return {}
      }
    }

    /**
     * getSwiperHeight
     * @description  calculate the height of swiper slider basing on data attr
     */
    function getSwiperHeight(object, attr) {
      var val = object.attr('data-' + attr),
        dim

      if (!val) {
        return undefined
      }

      dim = val.match(/(px)|(%)|(vh)$/i)

      if (dim.length) {
        switch (dim[0]) {
          case 'px':
            return parseFloat(val)
          case 'vh':
            return $(window).height() * (parseFloat(val) / 100)
          case '%':
            return object.width() * (parseFloat(val) / 100)
        }
      } else {
        return undefined
      }
    }

    /**
     * toggleSwiperInnerVideos
     * @description  toggle swiper videos on active slides
     */
    function toggleSwiperInnerVideos(swiper) {
      var prevSlide = $(swiper.slides[swiper.previousIndex]),
        nextSlide = $(swiper.slides[swiper.activeIndex]),
        videos

      prevSlide.find('video').each(function () {
        this.pause()
      })

      videos = nextSlide.find('video')
      if (videos.length) {
        videos.get(0).play()
      }
    }

    /**
     * toggleSwiperCaptionAnimation
     * @description  toggle swiper animations on active slides
     */
    function toggleSwiperCaptionAnimation(swiper) {
      var prevSlide = $(swiper.container),
        nextSlide = $(swiper.slides[swiper.activeIndex])

      prevSlide.find('[data-caption-animate]').each(function () {
        var $this = $(this)
        $this.removeClass('animated').removeClass($this.attr('data-caption-animate')).addClass('not-animated')
      })

      nextSlide.find('[data-caption-animate]').each(function () {
        var $this = $(this),
          delay = $this.attr('data-caption-delay')

        if (!isNoviBuilder) {
          setTimeout(
            function () {
              $this.removeClass('not-animated').addClass($this.attr('data-caption-animate')).addClass('animated')
            },
            delay ? parseInt(delay) : 0
          )
        } else {
          $this.removeClass('not-animated')
        }
      })
    }

    /**
     * @desc Initialize the gallery with set of images
     * @param {object} itemsToInit - jQuery object
     * @param {string} [addClass] - additional gallery class
     */
    function initLightGallery(itemsToInit, addClass) {
      if (!isNoviBuilder) {
        $(itemsToInit).lightGallery({
          thumbnail: $(itemsToInit).attr('data-lg-thumbnail') !== 'false',
          selector: "[data-lightgallery='item']",
          autoplay: $(itemsToInit).attr('data-lg-autoplay') === 'true',
          pause: parseInt($(itemsToInit).attr('data-lg-autoplay-delay')) || 5000,
          addClass: addClass,
          mode: $(itemsToInit).attr('data-lg-animation') || 'lg-slide',
          loop: $(itemsToInit).attr('data-lg-loop') !== 'false'
        })
      }
    }

    /**
     * @desc Initialize the gallery with dynamic addition of images
     * @param {object} itemsToInit - jQuery object
     * @param {string} [addClass] - additional gallery class
     */
    function initDynamicLightGallery(itemsToInit, addClass) {
      if (!isNoviBuilder) {
        $(itemsToInit).on('click', function () {
          $(itemsToInit).lightGallery({
            thumbnail: $(itemsToInit).attr('data-lg-thumbnail') !== 'false',
            selector: "[data-lightgallery='item']",
            autoplay: $(itemsToInit).attr('data-lg-autoplay') === 'true',
            pause: parseInt($(itemsToInit).attr('data-lg-autoplay-delay')) || 5000,
            addClass: addClass,
            mode: $(itemsToInit).attr('data-lg-animation') || 'lg-slide',
            loop: $(itemsToInit).attr('data-lg-loop') !== 'false',
            dynamic: true,
            dynamicEl: JSON.parse($(itemsToInit).attr('data-lg-dynamic-elements')) || []
          })
        })
      }
    }

    /**
     * @desc Initialize the gallery with one image
     * @param {object} itemToInit - jQuery object
     * @param {string} [addClass] - additional gallery class
     */
    function initLightGalleryItem(itemToInit, addClass) {
      if (!isNoviBuilder) {
        $(itemToInit).lightGallery({
          selector: 'this',
          addClass: addClass,
          counter: false,
          youtubePlayerParams: {
            modestbranding: 1,
            showinfo: 0,
            rel: 0,
            controls: 0
          },
          vimeoPlayerParams: {
            byline: 0,
            portrait: 0
          }
        })
      }
    }

    /**
     * Live Search
     * @description  create live search results
     */
    function liveSearch(options) {
      $('#' + options.live)
        .removeClass('cleared')
        .html()
      options.current++
      options.spin.addClass('loading')
      $.get(
        handler,
        {
          s: decodeURI(options.term),
          liveSearch: options.live,
          dataType: 'html',
          liveCount: options.liveCount,
          filter: options.filter,
          template: options.template
        },
        function (data) {
          options.processed++
          var live = $('#' + options.live)
          if (options.processed == options.current && !live.hasClass('cleared')) {
            live.find('> #search-results').removeClass('active')
            live.html(data)
            setTimeout(function () {
              live.find('> #search-results').addClass('active')
            }, 50)
          }
          options.spin.parents('.rd-search').find('.input-group-addon').removeClass('loading')
        }
      )
    }

    /**
     * @desc Attach form validation to elements
     * @param {object} elements - jQuery object
     */
    function attachFormValidator(elements) {
      // Custom validator - phone number
      regula.custom({
        name: 'PhoneNumber',
        defaultMessage: 'Invalid phone number format',
        validator: function () {
          if (this.value === '') return true
          else return /^(\+\d)?[0-9\-\(\) ]{5,}$/i.test(this.value)
        }
      })

      for (let i = 0; i < elements.length; i++) {
        let o = $(elements[i]),
          v
        o.addClass('form-control-has-validation').after("<span class='form-validation'></span>")
        v = o.parent().find('.form-validation')
        if (v.is(':last-child')) o.addClass('form-control-last-child')
      }

      elements
        .on('input change propertychange blur', function (e) {
          let $this = $(this),
            results

          if (e.type !== 'blur') if (!$this.parent().hasClass('has-error')) return
          if ($this.parents('.rd-mailform').hasClass('success')) return

          if ((results = $this.regula('validate')).length) {
            for (let i = 0; i < results.length; i++) {
              $this.siblings('.form-validation').text(results[i].message).parent().addClass('has-error')
            }
          } else {
            $this.siblings('.form-validation').text('').parent().removeClass('has-error')
          }
        })
        .regula('bind')

      let regularConstraintsMessages = [
        {
          type: regula.Constraint.Required,
          newMessage: 'The text field is required.'
        },
        {
          type: regula.Constraint.Email,
          newMessage: 'The email is not a valid email.'
        },
        {
          type: regula.Constraint.Numeric,
          newMessage: 'Only numbers are required'
        },
        {
          type: regula.Constraint.Selected,
          newMessage: 'Please choose an option.'
        }
      ]

      for (let i = 0; i < regularConstraintsMessages.length; i++) {
        let regularConstraint = regularConstraintsMessages[i]

        regula.override({
          constraintType: regularConstraint.type,
          defaultMessage: regularConstraint.newMessage
        })
      }
    }

    /**
     * @desc Check if all elements pass validation
     * @param {object} elements - object of items for validation
     * @param {object} captcha - captcha object for validation
     * @return {boolean}
     */
    function isValidated(elements, captcha) {
      let results,
        errors = 0

      if (elements.length) {
        for (let j = 0; j < elements.length; j++) {
          let $input = $(elements[j])
          if ((results = $input.regula('validate')).length) {
            for (let k = 0; k < results.length; k++) {
              errors++
              $input.siblings('.form-validation').text(results[k].message).parent().addClass('has-error')
            }
          } else {
            $input.siblings('.form-validation').text('').parent().removeClass('has-error')
          }
        }

        if (captcha) {
          if (captcha.length) {
            return validateReCaptcha(captcha) && errors === 0
          }
        }

        return errors === 0
      }
      return true
    }

    /**
     * @desc Validate google reCaptcha
     * @param {object} captcha - captcha object for validation
     * @return {boolean}
     */
    function validateReCaptcha(captcha) {
      let captchaToken = captcha.find('.g-recaptcha-response').val()

      if (captchaToken.length === 0) {
        captcha.siblings('.form-validation').html('Please, prove that you are not robot.').addClass('active')
        captcha.closest('.form-wrap').addClass('has-error')

        captcha.on('propertychange', function () {
          let $this = $(this),
            captchaToken = $this.find('.g-recaptcha-response').val()

          if (captchaToken.length > 0) {
            $this.closest('.form-wrap').removeClass('has-error')
            $this.siblings('.form-validation').removeClass('active').html('')
            $this.off('propertychange')
          }
        })

        return false
      }

      return true
    }

    /**
     * @desc Initialize Google reCaptcha
     */
    window.onloadCaptchaCallback = function () {
      for (let i = 0; i < plugins.captcha.length; i++) {
        let $captcha = $(plugins.captcha[i]),
          resizeHandler = function () {
            let frame = this.querySelector('iframe'),
              inner = this.firstElementChild,
              inner2 = inner.firstElementChild,
              containerRect = null,
              frameRect = null,
              scale = null

            inner2.style.transform = ''
            inner.style.height = 'auto'
            inner.style.width = 'auto'

            containerRect = this.getBoundingClientRect()
            frameRect = frame.getBoundingClientRect()
            scale = containerRect.width / frameRect.width

            if (scale < 1) {
              inner2.style.transform = 'scale(' + scale + ')'
              inner.style.height = frameRect.height * scale + 'px'
              inner.style.width = frameRect.width * scale + 'px'
            }
          }.bind(plugins.captcha[i])

        grecaptcha.render($captcha.attr('id'), {
          sitekey: $captcha.attr('data-sitekey'),
          size: $captcha.attr('data-size') ? $captcha.attr('data-size') : 'normal',
          theme: $captcha.attr('data-theme') ? $captcha.attr('data-theme') : 'light',
          callback: function () {
            $('.recaptcha').trigger('propertychange')
          }
        })

        $captcha.after("<span class='form-validation'></span>")

        if (plugins.captcha[i].hasAttribute('data-auto-size')) {
          resizeHandler()
          window.addEventListener('resize', resizeHandler)
        }
      }
    }

    /**
     * @desc Initialize Bootstrap tooltip with required placement
     * @param {string} tooltipPlacement
     */
    function initBootstrapTooltip(tooltipPlacement) {
      plugins.bootstrapTooltip.tooltip('dispose')

      if (window.innerWidth < 576) {
        plugins.bootstrapTooltip.tooltip({ placement: 'bottom' })
      } else {
        plugins.bootstrapTooltip.tooltip({ placement: tooltipPlacement })
      }
    }

    /**
     * @desc Google map function for getting latitude and longitude
     */
    function getLatLngObject(str, marker, map, callback) {
      let coordinates = {}
      try {
        coordinates = JSON.parse(str)
        callback(new google.maps.LatLng(coordinates.lat, coordinates.lng), marker, map)
      } catch (e) {
        map.geocoder.geocode({ address: str }, function (results, status) {
          if (status === google.maps.GeocoderStatus.OK) {
            let latitude = results[0].geometry.location.lat()
            let longitude = results[0].geometry.location.lng()

            callback(new google.maps.LatLng(parseFloat(latitude), parseFloat(longitude)), marker, map)
          }
        })
      }
    }

    /**
     * @desc Initialize Google maps
     */
    function initMaps() {
      let key

      for (let i = 0; i < plugins.maps.length; i++) {
        if (plugins.maps[i].hasAttribute('data-key')) {
          key = plugins.maps[i].getAttribute('data-key')
          break
        }
      }

      $.getScript(
        '//maps.google.com/maps/api/js?' + (key ? 'key=' + key + '&' : '') + 'libraries=geometry,places&v=quarterly',
        function () {
          let head = document.getElementsByTagName('head')[0],
            insertBefore = head.insertBefore

          head.insertBefore = function (newElement, referenceElement) {
            if (
              (newElement.href && newElement.href.indexOf('//fonts.googleapis.com/css?family=Roboto') !== -1) ||
              newElement.innerHTML.indexOf('gm-style') !== -1
            ) {
              return
            }
            insertBefore.call(head, newElement, referenceElement)
          }
          let geocoder = new google.maps.Geocoder()
          for (let i = 0; i < plugins.maps.length; i++) {
            let zoom = parseInt(plugins.maps[i].getAttribute('data-zoom'), 10) || 11
            let styles = plugins.maps[i].hasAttribute('data-styles')
              ? JSON.parse(plugins.maps[i].getAttribute('data-styles'))
              : []
            let center = plugins.maps[i].getAttribute('data-center') || 'New York'

            // Initialize map
            let map = new google.maps.Map(plugins.maps[i].querySelectorAll('.google-map')[0], {
              zoom: zoom,
              styles: styles,
              scrollwheel: false,
              center: {
                lat: 0,
                lng: 0
              }
            })

            // Add map object to map node
            plugins.maps[i].map = map
            plugins.maps[i].geocoder = geocoder
            plugins.maps[i].keySupported = true
            plugins.maps[i].google = google

            // Get Center coordinates from attribute
            getLatLngObject(center, null, plugins.maps[i], function (location, markerElement, mapElement) {
              mapElement.map.setCenter(location)
            })

            // Add markers from google-map-markers array
            let markerItems = plugins.maps[i].querySelectorAll('.google-map-markers li')

            if (markerItems.length) {
              let markers = []
              for (let j = 0; j < markerItems.length; j++) {
                let markerElement = markerItems[j]
                getLatLngObject(
                  markerElement.getAttribute('data-location'),
                  markerElement,
                  plugins.maps[i],
                  function (location, markerElement, mapElement) {
                    let icon = markerElement.getAttribute('data-icon') || mapElement.getAttribute('data-icon')
                    let activeIcon =
                      markerElement.getAttribute('data-icon-active') || mapElement.getAttribute('data-icon-active')
                    let info = markerElement.getAttribute('data-description') || ''
                    let infoWindow = new google.maps.InfoWindow({
                      content: info
                    })
                    markerElement.infoWindow = infoWindow
                    let markerData = {
                      position: location,
                      map: mapElement.map
                    }
                    if (icon) {
                      markerData.icon = icon
                    }
                    let marker = new google.maps.Marker(markerData)
                    markerElement.gmarker = marker
                    markers.push({
                      markerElement: markerElement,
                      infoWindow: infoWindow
                    })
                    marker.isActive = false
                    // Handle infoWindow close click
                    google.maps.event.addListener(
                      infoWindow,
                      'closeclick',
                      function (markerElement, mapElement) {
                        let markerIcon = null
                        markerElement.gmarker.isActive = false
                        markerIcon = markerElement.getAttribute('data-icon') || mapElement.getAttribute('data-icon')
                        markerElement.gmarker.setIcon(markerIcon)
                      }.bind(this, markerElement, mapElement)
                    )

                    // Set marker active on Click and open infoWindow
                    google.maps.event.addListener(
                      marker,
                      'click',
                      function (markerElement, mapElement) {
                        let markerIcon
                        if (markerElement.infoWindow.getContent().length === 0) return
                        let gMarker,
                          currentMarker = markerElement.gmarker,
                          currentInfoWindow
                        for (let k = 0; k < markers.length; k++) {
                          if (markers[k].markerElement === markerElement) {
                            currentInfoWindow = markers[k].infoWindow
                          }
                          gMarker = markers[k].markerElement.gmarker
                          if (gMarker.isActive && markers[k].markerElement !== markerElement) {
                            gMarker.isActive = false
                            markerIcon =
                              markers[k].markerElement.getAttribute('data-icon') || mapElement.getAttribute('data-icon')
                            gMarker.setIcon(markerIcon)
                            markers[k].infoWindow.close()
                          }
                        }

                        currentMarker.isActive = !currentMarker.isActive
                        if (currentMarker.isActive) {
                          if (
                            (markerIcon =
                              markerElement.getAttribute('data-icon-active') ||
                              mapElement.getAttribute('data-icon-active'))
                          ) {
                            currentMarker.setIcon(markerIcon)
                          }

                          currentInfoWindow.open(map, marker)
                        } else {
                          if (
                            (markerIcon =
                              markerElement.getAttribute('data-icon') || mapElement.getAttribute('data-icon'))
                          ) {
                            currentMarker.setIcon(markerIcon)
                          }
                          currentInfoWindow.close()
                        }
                      }.bind(this, markerElement, mapElement)
                    )
                  }
                )
              }
            }
          }
        }
      )
    }

    // Copyright Year (Evaluates correct copyright year)
    if (plugins.copyrightYear.length) {
      plugins.copyrightYear.text(initialDate.getFullYear())
    }

    // Google ReCaptcha
    if (plugins.captcha.length) {
      $.getScript('//www.google.com/recaptcha/api.js?onload=onloadCaptchaCallback&render=explicit&hl=en')
    }

    // Additional class on html if mac os.
    if (navigator.platform.match(/(Mac)/i)) {
      $html.addClass('mac-os')
    }

    // Adds some loosing functionality to IE browsers (IE Polyfills)
    if (isIE) {
      if (isIE === 12) $html.addClass('ie-edge')
      if (isIE === 11) $html.addClass('ie-11')
      if (isIE < 10) $html.addClass('lt-ie-10')
      if (isIE < 11) $html.addClass('ie-10')
    }

    // Bootstrap Tooltips
    if (plugins.bootstrapTooltip.length) {
      let tooltipPlacement = plugins.bootstrapTooltip.attr('data-bs-placement')
      initBootstrapTooltip(tooltipPlacement)

      $window.on('resize orientationchange', function () {
        initBootstrapTooltip(tooltipPlacement)
      })
    }

    // Add custom styling options for input[type="radio"]
    if (plugins.radio.length) {
      for (let i = 0; i < plugins.radio.length; i++) {
        $(plugins.radio[i]).addClass('radio-custom').after("<span class='radio-custom-dummy'></span>")
      }
    }

    // Add custom styling options for input[type="checkbox"]
    if (plugins.checkbox.length) {
      for (let i = 0; i < plugins.checkbox.length; i++) {
        $(plugins.checkbox[i]).addClass('checkbox-custom').after("<span class='checkbox-custom-dummy'></span>")
      }
    }

    /**
     * UI To Top
     * @description Enables ToTop Button
     */
    if (isDesktop && !isNoviBuilder) {
      $().UItoTop({
        inDelay: 0,
        outDelay: 0,
        easingType: 'linear',
        containerClass: 'ui-to-top fa fa-angle-up'
      })
    }

    // Google maps
    if (plugins.maps.length) {
      lazyInit(plugins.maps, initMaps)
    }

    // RD Navbar
    if (plugins.rdNavbar.length) {
      let navbar = plugins.rdNavbar,
        aliases = {
          '-': 0,
          '-sm-': 576,
          '-md-': 768,
          '-lg-': 992,
          '-xl-': 1200,
          '-xxl-': 1600
        },
        responsive = {},
        navItems = $('.rd-nav-item')

      for (let i = 0; i < navItems.length; i++) {
        let node = navItems[i]

        if (node.classList.contains('opened')) {
          node.classList.remove('opened')
        }
      }

      for (let alias in aliases) {
        let link = (responsive[aliases[alias]] = {})
        if (navbar.attr('data' + alias + 'layout')) link.layout = navbar.attr('data' + alias + 'layout')
        if (navbar.attr('data' + alias + 'device-layout'))
          link.deviceLayout = navbar.attr('data' + alias + 'device-layout')
        if (navbar.attr('data' + alias + 'hover-on'))
          link.focusOnHover = navbar.attr('data' + alias + 'hover-on') === 'true'
        if (navbar.attr('data' + alias + 'auto-height'))
          link.autoHeight = navbar.attr('data' + alias + 'auto-height') === 'true'
        if (navbar.attr('data' + alias + 'stick-up-offset'))
          link.stickUpOffset = navbar.attr('data' + alias + 'stick-up-offset')
        if (navbar.attr('data' + alias + 'stick-up')) link.stickUp = navbar.attr('data' + alias + 'stick-up') === 'true'
        if (isNoviBuilder) link.stickUp = false
        else if (navbar.attr('data' + alias + 'stick-up'))
          link.stickUp = navbar.attr('data' + alias + 'stick-up') === 'true'
      }

      plugins.rdNavbar.RDNavbar({
        anchorNav: !isNoviBuilder,
        stickUpClone:
          plugins.rdNavbar.attr('data-stick-up-clone') && !isNoviBuilder
            ? plugins.rdNavbar.attr('data-stick-up-clone') === 'true'
            : false,
        responsive: responsive,
        callbacks: {
          onStuck: function () {
            let navbarSearch = this.$element.find('.rd-search input')

            if (navbarSearch) {
              navbarSearch.val('').trigger('propertychange')
            }
          },
          onDropdownOver: function () {
            return !isNoviBuilder
          },
          onUnstuck: function () {
            if (this.$clone === null) return

            let navbarSearch = this.$clone.find('.rd-search input')

            if (navbarSearch) {
              navbarSearch.val('').trigger('propertychange')
              navbarSearch.trigger('blur')
            }
          }
        }
      })
    }

    /**
     * RD Search
     * @description Enables search
     */
    if (plugins.search.length || plugins.searchResults) {
      var handler = 'bat/rd-search.php'
      var defaultTemplate =
        '<h5 class="search_title"><a target="_top" href="#{href}" class="search_link">#{title}</a></h5>' +
        '<p>...#{token}...</p>' +
        '<p class="match"><em>Terms matched: #{count} - URL: #{href}</em></p>'
      var defaultFilter = '*.html'

      if (plugins.search.length) {
        for (i = 0; i < plugins.search.length; i++) {
          var searchItem = $(plugins.search[i]),
            options = {
              element: searchItem,
              filter: searchItem.attr('data-search-filter') ? searchItem.attr('data-search-filter') : defaultFilter,
              template: searchItem.attr('data-search-template')
                ? searchItem.attr('data-search-template')
                : defaultTemplate,
              live: searchItem.attr('data-search-live') ? searchItem.attr('data-search-live') : false,
              liveCount: searchItem.attr('data-search-live-count') ? parseInt(searchItem.attr('data-search-live')) : 4,
              current: 0,
              processed: 0,
              timer: {}
            }

          if ($('.rd-navbar-search-toggle').length) {
            var toggle = $('.rd-navbar-search-toggle')
            toggle.on('click', function () {
              if (!$(this).hasClass('active')) {
                searchItem.find('input').val('').trigger('propertychange')
              }
            })
          }

          if (options.live) {
            var clearHandler = false

            searchItem.find('input').on(
              'keyup input propertychange',
              $.proxy(
                function () {
                  this.term = this.element.find('input').val().trim()
                  this.spin = this.element.find('.input-group-addon')

                  clearTimeout(this.timer)

                  if (this.term.length > 2) {
                    this.timer = setTimeout(liveSearch(this), 200)

                    if (clearHandler == false) {
                      clearHandler = true

                      $('body').on('click', function (e) {
                        if ($(e.toElement).parents('.rd-search').length == 0) {
                          $('#rd-search-results-live').addClass('cleared').html('')
                        }
                      })
                    }
                  } else if (this.term.length == 0) {
                    $('#' + this.live)
                      .addClass('cleared')
                      .html('')
                  }
                },
                options,
                this
              )
            )
          }

          searchItem.submit(
            $.proxy(
              function () {
                $('<input />')
                  .attr('type', 'hidden')
                  .attr('name', 'filter')
                  .attr('value', this.filter)
                  .appendTo(this.element)
                return true
              },
              options,
              this
            )
          )
        }
      }

      if (plugins.searchResults.length) {
        var regExp = /\?.*s=([^&]+)\&filter=([^&]+)/g
        var match = regExp.exec(location.search)

        if (match != null) {
          $.get(
            handler,
            {
              s: decodeURI(match[1]),
              dataType: 'html',
              filter: match[2],
              template: defaultTemplate,
              live: ''
            },
            function (data) {
              plugins.searchResults.html(data)
            }
          )
        }
      }
    }

    var interleaveOffset = -0.7

    var interleaveEffect = {
      effect: 'slide',
      speed: 1200,
      watchSlidesProgress: true,
      onProgress: function (swiper, progress) {
        for (var i = 0; i < swiper.slides.length; i++) {
          var slide = swiper.slides[i]
          var translate, innerTranslate
          progress = slide.progress

          if (progress > 0) {
            translate = progress * swiper.width
            innerTranslate = translate * interleaveOffset
          } else {
            innerTranslate = Math.abs(progress * swiper.width) * interleaveOffset
            translate = 0
          }

          slide.style.transform = 'translate3d(' + translate + 'px,0,0)'
          slide.getElementsByClassName('slide-inner')[0].style.transform = 'translate3d(' + innerTranslate + 'px,0,0)'
        }
      },

      onTouchStart: function (swiper) {
        for (var i = 0; i < swiper.slides.length; i++) {
          this.slide.style.transition = '0s'
        }
      },

      onSetTransition: function (swiper, speed) {
        for (var i = 0; i < swiper.slides.length; i++) {
          $(swiper.slides[i])
            .find('.slide-inner')
            .andSelf()
            .css({ transition: speed + 'ms' })
        }
      },
      onSlideNextStart: function (swiper) {
        setTimeout(function () {
          toggleSwiperCaptionAnimation(swiper)
        }, 300)
      },
      onSlidePrevStart: function (swiper) {
        setTimeout(function () {
          toggleSwiperCaptionAnimation(swiper)
        }, 300)
      },

      onTransitionEnd: function (swiper) {
        return false
      }
    }

    // Swiper 3.4.1
    if (plugins.swiper.length) {
      var i
      for (i = 0; i < plugins.swiper.length; i++) {
        var s = $(plugins.swiper[i])
        var pag = s.find('.swiper-pagination'),
          next = s.find('.swiper-button-next'),
          prev = s.find('.swiper-button-prev'),
          bar = s.find('.swiper-scrollbar'),
          swiperSlide = s.find('.swiper-slide')

        for (let j = 0; j < swiperSlide.length; j++) {
          var $this = $(swiperSlide[j]),
            url

          if ((url = $this.attr('data-slide-bg'))) {
            $this.css({
              'background-image': 'url(' + url + ')',
              'background-size': 'cover'
            })
          }
        }

        swiperSlide.end().find('[data-caption-animate]').addClass('not-animated').end()

        var swiperOptions = {
          autoplay: isNoviBuilder
            ? null
            : s.attr('data-autoplay')
            ? s.attr('data-autoplay') === 'false'
              ? undefined
              : s.attr('data-autoplay')
            : 5000,
          direction: s.attr('data-direction') ? s.attr('data-direction') : 'horizontal',
          effect: s.attr('data-slide-effect') ? s.attr('data-slide-effect') : 'slide',
          speed: s.attr('data-slide-speed') ? s.attr('data-slide-speed') : 600,
          keyboardControl: s.attr('data-keyboard') === 'true',
          mousewheelControl: s.attr('data-mousewheel') === 'true',
          mousewheelReleaseOnEdges: s.attr('data-mousewheel-release') === 'true',
          nextButton: next.length ? next.get(0) : s.attr('data-custom-next') ? $(s.attr('data-custom-next')) : null,
          prevButton: prev.length ? prev.get(0) : s.attr('data-custom-prev') ? $(s.attr('data-custom-prev')) : null,
          pagination: pag.length ? pag.get(0) : null,
          paginationClickable: pag.length ? pag.attr('data-clickable') !== 'false' : false,
          paginationBulletRender: pag.length
            ? pag.attr('data-index-bullet') === 'true'
              ? function (index, className) {
                  return '<span class="' + className + '">' + (index + 1) + '</span>'
                }
              : null
            : null,
          scrollbar: bar.length ? bar.get(0) : null,
          scrollbarDraggable: bar.length ? bar.attr('data-draggable') !== 'false' : true,
          scrollbarHide: bar.length ? bar.attr('data-draggable') === 'false' : false,
          loop: isNoviBuilder ? false : s.attr('data-loop') !== 'false',
          loopAdditionalSlides: s.attr('data-additional-slides') ? parseInt(s.attr('data-additional-slides')) : 0,
          simulateTouch:
            s.attr('data-simulate-touch') && !isNoviBuilder ? s.attr('data-simulate-touch') === 'true' : false,
          onTransitionStart: function (swiper) {
            toggleSwiperInnerVideos(swiper)
          },
          onTransitionEnd: function (swiper) {
            toggleSwiperCaptionAnimation(swiper)
          },
          onInit: function (swiper) {
            toggleSwiperInnerVideos(swiper)
            toggleSwiperCaptionAnimation(swiper)
            $(window).on('resize', function () {
              swiper.update(true)
            })
          },
          onPaginationRendered: function (swiper, paginationContainer) {
            var container = $(paginationContainer)
            if (container.hasClass('swiper-pagination_marked')) {
              container.append('<span class="swiper-pagination__mark"></span>')
            }
          }
        }

        if (s.attr('data-custom-slide-effect') == 'interLeaveEffect') {
          swiperOptions = $.extend(swiperOptions, interleaveEffect)
        }

        plugins.swiper[i] = s.swiper(swiperOptions)

        $(window)
          .on('resize', function () {
            var mh = getSwiperHeight(s, 'min-height'),
              h = getSwiperHeight(s, 'height')
            if (h) {
              s.css('height', mh ? (mh > h ? mh : h) : h)
            }
          })
          .trigger('resize')
      }
    }

    // Owl carousel
    if (plugins.owl.length) {
      for (let i = 0; i < plugins.owl.length; i++) {
        let node = plugins.owl[i],
          params = parseJSON(node.getAttribute('data-owl')),
          defaults = {
            items: 1,
            margin: 30,
            loop: true,
            mouseDrag: false,
            stagePadding: 0,
            nav: false,
            navText: [],
            dots: false,
            autoplay: true,
            autoplayTimeout: 3000,
            autoplayHoverPause: true
          },
          xMode = {
            autoplay: false,
            loop: false,
            mouseDrag: false
          },
          generated = {
            autoplay: node.getAttribute('data-autoplay') === 'true',
            loop: node.getAttribute('data-loop') !== 'false',
            mouseDrag: node.getAttribute('data-mouse-drag') !== 'false',
            responsive: {}
          },
          aliases = ['-', '-sm-', '-md-', '-lg-', '-xl-', '-xxl-'],
          values = [0, 576, 768, 992, 1200, 1600],
          responsive = generated.responsive

        for (let j = 0; j < values.length; j++) {
          responsive[values[j]] = {}

          for (let k = j; k >= -1; k--) {
            if (!responsive[values[j]]['items'] && node.getAttribute('data' + aliases[k] + 'items')) {
              responsive[values[j]]['items'] =
                k < 0 ? 1 : parseInt(node.getAttribute('data' + aliases[k] + 'items'), 10)
            }
            if (
              !responsive[values[j]]['stagePadding'] &&
              responsive[values[j]]['stagePadding'] !== 0 &&
              node.getAttribute('data' + aliases[k] + 'stage-padding')
            ) {
              responsive[values[j]]['stagePadding'] =
                k < 0 ? 0 : parseInt(node.getAttribute('data' + aliases[k] + 'stage-padding'), 10)
            }
            if (
              !responsive[values[j]]['margin'] &&
              responsive[values[j]]['margin'] !== 0 &&
              node.getAttribute('data' + aliases[k] + 'margin')
            ) {
              responsive[values[j]]['margin'] =
                k < 0 ? 30 : parseInt(node.getAttribute('data' + aliases[k] + 'margin'), 10)
            }
          }
        }

        // Initialize lightgallery items in cloned owl items
        $(node).on('initialized.owl.carousel', function () {
          initLightGalleryItem($(node).find('[data-lightgallery="item"]'), 'lightGallery-in-carousel')
        })

        node.owl = $(node)
        $(node).owlCarousel(
          Util.merge(isNoviBuilder ? [defaults, params, generated, xMode] : [defaults, params, generated])
        )
      }
    }

    /**
     * WOW
     * @description Enables Wow animation plugin
     */
    if (isDesktop && $html.hasClass('wow-animation') && $('.wow').length) {
      new WOW().init()
    }

    /**
     * Slick carousel
     * @description  Enable Slick carousel plugin
     */
    if (plugins.slick.length) {
      var i
      for (i = 0; i < plugins.slick.length; i++) {
        var $slickItem = $(plugins.slick[i])

        $slickItem.on('init', function (slick) {
          initLightGallery($('[data-lightgallery="group-slick"]'), 'lightGallery-in-carousel')
          initLightGallery($('[data-lightgallery="item-slick"]'), 'lightGallery-in-carousel')
        })

        $slickItem
          .slick({
            slidesToScroll: parseInt($slickItem.attr('data-slide-to-scroll'), 10) || 1,
            asNavFor: $slickItem.attr('data-for') || false,
            dots: $slickItem.attr('data-dots') === 'true',
            infinite: isNoviBuilder ? false : $slickItem.attr('data-loop') === 'true',
            focusOnSelect: true,
            arrows: $slickItem.attr('data-arrows') === 'true',
            swipe: $slickItem.attr('data-swipe') === 'true',
            autoplay: isNoviBuilder ? false : $slickItem.attr('data-autoplay') === 'true',
            vertical: $slickItem.attr('data-vertical') === 'true',
            centerMode: $slickItem.attr('data-center-mode') === 'true',
            centerPadding: $slickItem.attr('data-center-padding') ? $slickItem.attr('data-center-padding') : '0.50',
            mobileFirst: true,
            responsive: [
              {
                breakpoint: 0,
                settings: {
                  slidesToShow: parseInt($slickItem.attr('data-items')) || 1,
                  vertical: $slickItem.attr('data-vertical') == 'true' || false
                }
              },
              {
                breakpoint: 479,
                settings: {
                  slidesToShow: parseInt($slickItem.attr('data-xs-items')) || 1,
                  vertical: $slickItem.attr('data-xs-vertical') == 'true' || false
                }
              },
              {
                breakpoint: 767,
                settings: {
                  slidesToShow: parseInt($slickItem.attr('data-sm-items')) || 1,
                  vertical: $slickItem.attr('data-sm-vertical') == 'true' || false
                }
              },
              {
                breakpoint: 992,
                settings: {
                  slidesToShow: parseInt($slickItem.attr('data-md-items')) || 1,
                  vertical: $slickItem.attr('data-md-vertical') == 'true' || false
                }
              },
              {
                breakpoint: 1200,
                settings: {
                  slidesToShow: parseInt($slickItem.attr('data-lg-items')) || 1,
                  vertical: $slickItem.attr('data-lg-vertical') == 'true' || false
                }
              }
            ]
          })
          .on('afterChange', function (event, slick, currentSlide, nextSlide) {
            var $this = $(this),
              childCarousel = $this.attr('data-child')

            if (childCarousel) {
              $(childCarousel + ' .slick-slide').removeClass('slick-current')
              $(childCarousel + ' .slick-slide')
                .eq(currentSlide)
                .addClass('slick-current')
            }
          })
      }
    }

    // Bootstrap Tabs
    if (plugins.bootstrapTabs.length) {
      for (let i = 0; i < plugins.bootstrapTabs.length; i++) {
        let bootstrapTab = $(plugins.bootstrapTabs[i])

        //If have slick carousel inside tab - resize slick carousel on click
        if (bootstrapTab.find('.slick-slider').length) {
          bootstrapTab.find('.nav-tabs > li > a').on(
            'click',
            $.proxy(function () {
              let $this = $(this)
              let setTimeOutTime = isNoviBuilder ? 1500 : 300

              setTimeout(function () {
                $this.find('.tab-content .tab-pane.active .slick-slider').slick('setPosition')
              }, setTimeOutTime)
            }, bootstrapTab)
          )
        }

        let tabs = plugins.bootstrapTabs[i].querySelectorAll('.nav li a')

        for (var t = 0; t < tabs.length; t++) {
          var tab = tabs[t],
            target = document.querySelector(tabs[t].getAttribute('href'))

          tab.classList.remove('active', 'show')
          target.classList.remove('active', 'show')

          if (t === 0) {
            tab.classList.add('active', 'show')
            target.classList.add('active', 'show')
          }
        }
      }
    }

    // Bootstrap Card
    if (plugins.bootstrapCards.length) {
      for (let i = 0; i < plugins.bootstrapCards.length; i++) {
        let bootstrapCard = plugins.bootstrapCards[i]

        let cardHeads = bootstrapCard.querySelectorAll('.card-header a')

        for (let t = 0; t < cardHeads.length; t++) {
          let cardHead = cardHeads[t]

          cardHead.classList.add('collapsed')
          cardHead.setAttribute('aria-expanded', 'false')

          if (t === 0) {
            cardHead.classList.remove('collapsed')
            cardHead.setAttribute('aria-expanded', 'true')
          }
        }
      }
    }

    // RD Input Label
    if (plugins.rdInputLabel.length) {
      plugins.rdInputLabel.RDInputLabel()
    }

    // Regula
    if (plugins.regula.length) {
      attachFormValidator(plugins.regula)
    }

    // RD Mailform
    if (plugins.rdMailForm.length) {
      let i,
        j,
        k,
        msg = {
          MF000: 'Successfully sent!',
          MF001: 'Recipients are not set!',
          MF002: 'Form will not work locally!',
          MF003: 'Please, define email field in your form!',
          MF004: 'Please, define type of your form!',
          MF254: 'Something went wrong with PHPMailer!',
          MF255: 'Aw, snap! Something went wrong.'
        }

      for (i = 0; i < plugins.rdMailForm.length; i++) {
        let $form = $(plugins.rdMailForm[i]),
          formHasCaptcha = false

        $form.attr('novalidate', 'novalidate').ajaxForm({
          data: {
            'form-type': $form.attr('data-form-type') || 'contact',
            counter: i
          },
          beforeSubmit: function (arr, $form, options) {
            if (isNoviBuilder) return

            let form = $(plugins.rdMailForm[this.extraData.counter]),
              inputs = form.find('[data-constraints]'),
              output = $('#' + form.attr('data-form-output')),
              captcha = form.find('.recaptcha'),
              captchaFlag = true

            output.removeClass('active error success')

            if (isValidated(inputs, captcha)) {
              // veify reCaptcha
              if (captcha.length) {
                let captchaToken = captcha.find('.g-recaptcha-response').val(),
                  captchaMsg = {
                    CPT001: 'Please, setup you "site key" and "secret key" of reCaptcha',
                    CPT002: 'Something wrong with google reCaptcha'
                  }

                formHasCaptcha = true

                $.ajax({
                  method: 'POST',
                  url: 'bat/reCaptcha.php',
                  data: { 'g-recaptcha-response': captchaToken },
                  async: false
                }).done(function (responceCode) {
                  if (responceCode !== 'CPT000') {
                    if (output.hasClass('snackbars')) {
                      output.html(
                        '<p><span class="icon text-middle mdi mdi-check icon-xxs"></span><span>' +
                          captchaMsg[responceCode] +
                          '</span></p>'
                      )

                      setTimeout(function () {
                        output.removeClass('active')
                      }, 3500)

                      captchaFlag = false
                    } else {
                      output.html(captchaMsg[responceCode])
                    }

                    output.addClass('active')
                  }
                })
              }

              if (!captchaFlag) {
                return false
              }

              form.addClass('form-in-process')

              if (output.hasClass('snackbars')) {
                output.html(
                  '<p><span class="icon text-middle fa fa-circle-o-notch fa-spin icon-xxs"></span><span>Sending</span></p>'
                )
                output.addClass('active')
              }
            } else {
              return false
            }
          },
          error: function (result) {
            if (isNoviBuilder) return

            let output = $('#' + $(plugins.rdMailForm[this.extraData.counter]).attr('data-form-output')),
              form = $(plugins.rdMailForm[this.extraData.counter])

            output.text(msg[result])
            form.removeClass('form-in-process')

            if (formHasCaptcha) {
              grecaptcha.reset()
              window.dispatchEvent(new Event('resize'))
            }
          },
          success: function (result) {
            if (isNoviBuilder) return

            let form = $(plugins.rdMailForm[this.extraData.counter]),
              output = $('#' + form.attr('data-form-output')),
              select = form.find('select')

            form.addClass('success').removeClass('form-in-process')

            if (formHasCaptcha) {
              grecaptcha.reset()
              window.dispatchEvent(new Event('resize'))
            }

            result = result.length === 5 ? result : 'MF255'
            output.text(msg[result])

            if (result === 'MF000') {
              if (output.hasClass('snackbars')) {
                output.html(
                  '<p><span class="icon text-middle mdi mdi-check icon-xxs"></span><span>' + msg[result] + '</span></p>'
                )
              } else {
                output.addClass('active success')
              }
            } else {
              if (output.hasClass('snackbars')) {
                output.html(
                  ' <p class="snackbars-left"><span class="icon icon-xxs mdi mdi-alert-outline text-middle"></span><span>' +
                    msg[result] +
                    '</span></p>'
                )
              } else {
                output.addClass('active error')
              }
            }

            form.clearForm()

            if (select.length) {
              select.select2('val', '')
            }

            form.find('input, textarea').trigger('blur')

            setTimeout(function () {
              output.removeClass('active error success')
              form.removeClass('success')
            }, 3500)
          }
        })
      }
    }

    /**
     * Custom Toggles
     */
    if (plugins.customToggle.length) {
      var i

      for (i = 0; i < plugins.customToggle.length; i++) {
        var $this = $(plugins.customToggle[i])

        $this.on(
          'click',
          $.proxy(function (event) {
            event.preventDefault()
            var $ctx = $(this)
            $($ctx.attr('data-custom-toggle')).add(this).toggleClass('active')
          }, $this)
        )

        if ($this.attr('data-custom-toggle-hide-on-blur') === 'true') {
          $('body').on('click', $this, function (e) {
            if (
              e.target !== e.data[0] &&
              $(e.data.attr('data-custom-toggle')).find($(e.target)).length &&
              e.data.find($(e.target)).length == 0
            ) {
              $(e.data.attr('data-custom-toggle')).add(e.data[0]).removeClass('active')
            }
          })
        }

        if ($this.attr('data-custom-toggle-disable-on-blur') === 'true') {
          $('body').on('click', $this, function (e) {
            if (
              e.target !== e.data[0] &&
              $(e.data.attr('data-custom-toggle')).find($(e.target)).length == 0 &&
              e.data.find($(e.target)).length == 0
            ) {
              $(e.data.attr('data-custom-toggle')).add(e.data[0]).removeClass('active')
            }
          })
        }
      }
    }

    /**
     * Fixed height
     */
    if (plugins.fixedHeight) {
      for (var i = 0; i < plugins.fixedHeight.length; i++) {
        $(window).on(
          'resize orientationchange',
          (function (object) {
            setFixedHeight(object)
          })(plugins.fixedHeight[i])
        )
      }

      $window.trigger('resize')
    }

    function setFixedHeight(object) {
      object.style.minHeight = object.offsetHeight + 'px'
    }

    /**
     * RD Twitter Feed
     * @description Enables RD Twitter Feed plugin
     */
    if (plugins.twitterfeed.length > 0) {
      var i
      for (i = 0; i < plugins.twitterfeed.length; i++) {
        var twitterfeedItem = plugins.twitterfeed[i]
        $(twitterfeedItem).RDTwitter({})
      }
    }

    /**
     * D3 Charts
     * @description Enables D3 Charts plugin
     */
    if (plugins.d3Charts.length) {
      // for (i = 0; i < plugins.d3Charts.length; i++) {
      //   var d3ChartsItem = $(plugins.d3Charts[i]),
      //     d3ChartItemObject = parseJSONObject(d3ChartsItem, 'data-graph-object');
      //   c3ChartsArray.push(c3.generate(d3ChartItemObject));
      // }
    }

    function fillNumbers(n) {
      return Array.apply(null, { length: n }).map(Function.call, Number)
    }

    var d3Charts = []
    var lineChartObjectData = [1, 2, 1.3, 3, 4.6, 2, 1.8, 3, 3.3, 3.6],
      lineChartObject = {
        bindto: '#line-chart',
        legend: {
          show: false
        },
        color: {
          pattern: ['#ec931f']
        },
        point: {
          r: 4
        },
        padding: {
          left: 30,
          right: 30,
          top: 0,
          bottom: 0
        },
        data: {
          x: 'x',
          columns: [['x', 1, 1.5, 3, 4.4, 5, 7, 9, 10, 11, 12], ['data1'].concat(lineChartObjectData)],
          axes: {
            data1: 'y'
          },
          type: 'area',
          classes: {
            data1: 'stocks-rating-chart'
          }
        },
        grid: {
          x: {
            show: true
          },
          y: {
            show: true
          }
        },
        labels: true,
        axis: {
          x: {
            min: 0,
            max: 12.5,
            tick: {
              values: fillNumbers(13),
              format: function (x) {
                return ('0' + x).slice(-2)
              },
              outer: false
            },
            padding: {
              left: 0,
              right: 0
            }
          },
          y: {
            min: 0,
            max: 6,
            tick: {
              values: fillNumbers(13),
              format: function (x) {
                return x == 0 ? '' : ('0' + x).slice(-2)
              },
              outer: false
            },
            padding: {
              top: 0,
              bottom: 0
            }
          }
        },
        tooltip: {
          format: {
            name: function (name, ratio, id, index) {
              return ''
            },
            value: function (value, ratio, id, index) {
              var val = Math.round(
                typeof lineChartObjectData[index - 1] === 'undefined'
                  ? 0
                  : ((value - lineChartObjectData[index - 1]) / value) * 100
              )
              return (val == 0 ? '' : val > 0 ? '+ ' : '- ') + Math.abs(val) + ' %'
            }
          }
        },
        line: {
          connectNull: true
        }
      }

    var lineChartObjectData2 = [
        [1, 2, 1.5, 3, 2, 1.6, 2],
        [2.5, 3.5, 3, 4.5, 3.5, 4.3, 4.8, 5]
      ],
      lineChartObject2 = {
        bindto: '#line-chart-2',
        legend: {
          show: false
        },
        color: {
          pattern: ['#ec931f', '#8cb1d3']
        },
        point: {
          r: 4
        },
        padding: {
          left: 30,
          right: 30,
          top: 0,
          bottom: 0
        },
        data: {
          xs: {
            data1: 'x1',
            data2: 'x2'
          },
          names: {
            data1: '2016',
            data2: '2017'
          },
          columns: [
            ['x1', 1, 1.5, 3, 4.4, 7, 9, 12],
            ['x2', 1, 1.5, 3, 4.4, 7, 10, 11, 12],
            ['data1'].concat(lineChartObjectData2[0]),
            ['data2'].concat(lineChartObjectData2[1])
          ],
          axes: {
            data1: 'y'
          }
        },
        grid: {
          x: {
            show: true
          },
          y: {
            show: true
          }
        },
        labels: true,
        axis: {
          x: {
            min: 0,
            max: 12.5,
            tick: {
              values: fillNumbers(13),
              format: function (x) {
                return ('0' + x).slice(-2)
              },
              outer: false
            },
            padding: {
              left: 0,
              right: 0
            }
          },
          y: {
            min: 0,
            max: 6,
            tick: {
              values: fillNumbers(13),
              format: function (x) {
                return x == 0 ? '' : ('0' + x).slice(-2)
              },
              outer: false
            },
            padding: {
              top: 0,
              bottom: 0
            }
          }
        },
        tooltip: {
          format: {
            value: function (value) {
              return value
            }
          }
        },
        line: {
          connectNull: true
        }
      }

    d3Charts.push(c3.generate(lineChartObject))
    d3Charts.push(c3.generate(lineChartObject2))

    // lightGallery
    if (plugins.lightGallery.length) {
      for (let i = 0; i < plugins.lightGallery.length; i++) {
        initLightGallery(plugins.lightGallery[i])
      }
    }

    // lightGallery item
    if (plugins.lightGalleryItem.length) {
      // Filter carousel items
      let notCarouselItems = []

      for (let z = 0; z < plugins.lightGalleryItem.length; z++) {
        if (
          !$(plugins.lightGalleryItem[z]).parents('.owl-carousel').length &&
          !$(plugins.lightGalleryItem[z]).parents('.swiper-slider').length &&
          !$(plugins.lightGalleryItem[z]).parents('.slick-slider').length
        ) {
          notCarouselItems.push(plugins.lightGalleryItem[z])
        }
      }

      plugins.lightGalleryItem = notCarouselItems

      for (let i = 0; i < plugins.lightGalleryItem.length; i++) {
        initLightGalleryItem(plugins.lightGalleryItem[i])
      }
    }

    // Dynamic lightGallery
    if (plugins.lightDynamicGalleryItem.length) {
      for (let i = 0; i < plugins.lightDynamicGalleryItem.length; i++) {
        initDynamicLightGallery(plugins.lightDynamicGalleryItem[i])
      }
    }

    /**
     * JQuery mousewheel plugin
     * @description  Enables jquery mousewheel plugin
     */
    if (plugins.scroller.length) {
      var i
      for (i = 0; i < plugins.scroller.length; i++) {
        var scrollerItem = $(plugins.scroller[i])

        scrollerItem.mCustomScrollbar({
          theme: scrollerItem.attr('data-theme') ? scrollerItem.attr('data-theme') : 'minimal',
          scrollInertia: 100,
          scrollButtons: { enable: false }
        })
      }
    }

    // Countdown
    if (plugins.countdown.length) {
      for (let i = 0; i < plugins.countdown.length; i++) {
        let node = plugins.countdown[i],
          countdown = aCountdown({
            node: node,
            from: node.getAttribute('data-from'),
            to: node.getAttribute('data-to'),
            count: node.getAttribute('data-count'),
            tick: 100
          })
      }
    }
  })
})()
