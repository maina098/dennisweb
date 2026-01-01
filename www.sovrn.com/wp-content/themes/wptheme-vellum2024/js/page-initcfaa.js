$(document).ready(function () {
  //legal toggles: hashtag no jump
  /*
  $('a[href^="#"]:not(.wp-block-button__link)')
    .click(function (e) {
      e.preventDefault();
      var target = $(this).attr("href");
      if ($(target).css("height") == "0px") {
        $(target).addClass("active");
        $(target).animate({ height: $(target).attr("data-height") });
      } else {
        $(target).removeClass("active");
        $(target).animate({ height: 0 });
      }
    })
    .each(function () {
      var target = $(this).attr("href");
      if (target && target != "#"){
		  $(target).attr("data-height", $(this.hash).height());
		  setTimeout(function () {
			$(target).css("height", 0);
		  }, 20);
	  }
    });

  */

  //menu 2024
  //find every <a href="#...."> that is before a .sub-menu and add a class to it
  $("#site-wrapper ul.menu > li > a[href^='#']").addClass("menu-trigger").on("mouseenter", function () {

    //hide all .sub-menus by removing their style tags
    $(".sub-menu, .menu-trigger").removeClass("active");
    //get the next .sub-menu and add a style
    $(this).addClass("active").next(".sub-menu").addClass("active");
    //add a class to wrapper-topnav
    $("#wrapper-topnav").addClass("active").on("mouseleave", function () {

      $(this).removeClass("active");
      $(".sub-menu").removeClass("active");

    });

  });
  //trigger the first mobile one
  $("#mobile-site-navigation .menu-trigger").first().addClass("active").next(".sub-menu").addClass("active");


  //topnav sticky behavior
  (function () {
    var previousScroll = 0;
    var menuTop = Math.round(($("#wrapper-topnav").offset().top / 100) * 10);
    var menuBottom =
      Math.round(((menuTop + $("#wrapper-topnav").outerHeight()) / 100) * 10) +
      10;
    $(window).scroll(function () {
      var currentScroll = Math.round(($(this).scrollTop() / 100) * 10);
      if (currentScroll == previousScroll) return;
      if (currentScroll > previousScroll || currentScroll <= menuTop) {
        //SCROLLING DOWN
        if (currentScroll <= menuBottom) {
          $("#wrapper-topnav").removeClass("sticky").removeClass("active").attr("style", ""); //.css('transform', 'translateY(0%)')
          $(".sub-menu").removeClass("active");
        } else {
          if (currentScroll > menuBottom)
          $("#wrapper-topnav").removeClass("sticky").removeClass("active")
          $(".sub-menu").removeClass("active");
            // $("#wrapper-topnav").css("transform", "translateY(-94px)");
        }
      } else {
        //SCROLLING UP
        if (currentScroll > menuBottom)
          $("#wrapper-topnav").addClass("sticky").attr("style", ""); //.css('transform', 'translateY(0%)')
      }
      previousScroll = currentScroll;
    });
  })();
  $("#topnav-trigger").on("mouseenter", function () {
    $("#wrapper-topnav").addClass("sticky").attr("style", "");
  });

  //search inputs; dynamic results
  $("input.wp-block-search__input")
    .on("keyup", function () {
      var searchTerm = $(this).val();
      if (searchTerm.length > 3)
        loadDynamicSearchResults($(this).parent(), searchTerm);
    })
    .on("focusin", function () {
      $(this).closest(".wp-block-search").addClass("search-active");
    })
    .on("focusout", function () {
      //incase they're clicking a link in the search results
      var input = $(this);
      setTimeout(function () {
        input.closest(".wp-block-search").removeClass("search-active");
        input.siblings(".search-results").remove();
      }, 200);
    });

  //category selector dropdown
  $(".wp-block-categories-dropdown select").wrap(
    "<div class='category-select-wrapper'></div>"
  ).after(`
    <button>Categories <i class="fas fa-angle-down fa-xs"></i></button>
    `);

  //dropdown blocks
  $(".dropdown-block").click(function(e) {
    //e.preventDefault();
    $(this).toggleClass("active")
  })

  if ($("#jobs-list").length) {
    loadJobs($("#jobs-list"));
  }
  

  //tab-bar (tabbed sections); on click
  $(".tab-bar a.wp-block-button__link").click(function (e) {
    e.preventDefault();
    var targetTab = $(this).attr("href").replace("#", "");
    $(this)
      .addClass("active")
      .parent()
      .siblings()
      .find(".wp-block-button__link")
      .removeClass("active");
    $("#" + targetTab)
      .addClass("active")
      .siblings()
      .removeClass("active");
  });
  //tab-bar; force clicks on the first button in each tab-bar
  $(
    ".tab-bar > .wp-block-button:first-child > a.wp-block-button__link"
  ).trigger("click");

  //carousel; add buttons
  var $carouselButtons = $(`
        <button class='carousel-prev muted'></button>
        <button class='carousel-next'></button>
    `);
  $(".carousel").each(function () {
    var carousel = $(this);
    //if screen is mobile, break out content from columns
    if ($(window).width() < 900) {
      carousel.children(".wp-block-columns").each(function () {
        $(this).replaceWith($(this).children());
      });
    }
    //create the slide data
    carousel.attr("data-current-slide", 1);
    carousel.attr("data-total-slides", carousel.children().length);
    //activate the first slide
    carousel.children().first().addClass("active");
    //add the buttons
    carousel.append($carouselButtons.clone());
    carousel.children(".carousel-prev").click(function () {
      navigateCarousel(carousel, -1);
    });
    carousel.children(".carousel-next").click(function () {
      navigateCarousel(carousel, 1);
    });
  });
});

//init new carousels with slick
$(".carousel-2").slick({
  centerMode: true,
  // centerPadding: '60px',
  slidesToShow: 3,
  dots: true,
  arrows:false,
  infinite: true,
  autoplay: true,
  autoplaySpeed: 6000,
  responsive: [
    {
      breakpoint: 1072,
      settings: {
        arrows: false,
        centerMode: true,
        centerPadding: '40px',
        slidesToShow: 1
      }
    }
  ]
});
$('.slick-slider').on('click', '.slick-slide', function (e) {
  e.stopPropagation();
  var index = $(this).data("slick-index");
  if ($('.slick-slider').slick('slickCurrentSlide') !== index) {
    $('.slick-slider').slick('slickGoTo', index);
  }
});

function loadJobs(container) {
  $.ajax({
    type: "GET",
    url: "https://boards-api.greenhouse.io/v1/boards/sovrn/jobs?content=true",
    success: function (result) {
      if (!result) {
        container.html("<p>Error.</p>");
      } else {
        container.html("");

        //create a new object for each job, filtered by department
        var jobsByDepartment = {};
        for (var i = 0; i < result.jobs.length; i++) {
          var job = result.jobs[i];
          var department = job.departments[0].name;
          if (!jobsByDepartment[department]) jobsByDepartment[department] = [];
          jobsByDepartment[department].push(job);
        }

        let jobsHtml = `<ul class="job-list no-list-styling">`;

        for (const department in jobsByDepartment) {
          const jobs = jobsByDepartment[department];
          const jobCount = jobs.length;

          jobsHtml += `<li>
                    <div class="label">
                    <h3>${department}</h3>
                    <span>${jobCount} Open position${
            jobCount > 1 ? "s" : ""
          }</span>
                    </div>
                    <ul class="job-list-items no-list-styling">`;

          for (const job in jobs) {
            const jobTitle = jobs[job].title;
            const jobLocation = jobs[job].location.name;
            const jobLink = jobs[job].absolute_url;

            jobsHtml += `<li>
                        <a href="${jobLink}" target="_blank">
                            <span class="job-title">${jobTitle}</span>
                            <span class="job-location font-xs">${jobLocation}</span>
                        </a>
                        </li>`;
          }

          jobsHtml += `</ul></li>`;
        }

        jobsHtml += `</ul>`;

        container.html(jobsHtml);

        $(".job-list .label").click(function () {
          $(this).parent().toggleClass("active");
        });
      }
    },
  });
}

var searchRequest = null;
function loadDynamicSearchResults(searchInput, searchTerm) {
  if (searchInput.attr("data-search-term") == searchTerm) return;
  if (searchRequest) searchRequest.abort();

  searchInput.attr("data-search-term", searchTerm);
  searchInput.find(".search-results").remove();
  searchInput.append(
    '<div class="search-results"><p class="text-center p-1">Searching...</p></div>'
  );

  searchRequest = $.ajax({
    type: "POST",
    url: "/?pq=1&s=" + searchTerm,
    success: function (result) {
      if (result) {
        searchInput.find(".search-results").html(result);
      } else {
        searchInput
          .find(".search-results")
          .html('<p class="color-gray text-center p-1">No results found.</p>');
      }
    },
  });
}

function navigateCarousel(carousel, direction) {
  var currentSlide = parseInt(carousel.attr("data-current-slide"));
  var totalSlides = parseInt(carousel.attr("data-total-slides"));
  var nextSlide = currentSlide + direction;

  carousel.children(".carousel-prev, .carousel-next").removeClass("muted");

  if (nextSlide == totalSlides) {
    carousel.children(".carousel-next").addClass("muted");
  }
  if (nextSlide == 1) {
    carousel.children(".carousel-prev").addClass("muted");
  }

  carousel.children().removeClass("active");
  carousel.children("*:nth-child(" + nextSlide + ")").addClass("active");

  carousel
    .children()
    .first()
    .css("margin-left", "-" + parseInt(10 * (nextSlide - 1)) + "%");
  carousel.attr("data-current-slide", nextSlide);
}
