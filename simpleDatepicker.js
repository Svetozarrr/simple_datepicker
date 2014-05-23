(function ($) {

  $.fn.simpleDatepicker = function(options) {
    var settings = $.extend({}, {
        startYear: new Date().getFullYear(),
        startMonth: new Date().getMonth() + 1,
        labelText: 'Choose a date',
        lang: 'en',
        dateRange: false
    }, options);

    var monthes = {
        ru: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
        en: ['Jan', 'Feb', 'March', 'Apr', 'May', 'June', 'July', 'Aug', 'September', 'Оct', 'Nov', 'Dec']
    };

    return this.each(function(){
      if ($(this).is('input[type="date"]')) {
        $(this).each(createDatePickerWrapper);
        $(this).each(createDatePicker);
        if(settings.dateRange) {
          $(this).each(createDateRangePicker);
        }
        $(this).each(toggleDatePicker);
        $(this).each(controlDatePicker);
        $(this).each(chooseDate);
      } else {
        console.error('Illegal choice');
      }
    });

      function createDatePickerWrapper() {
        var inputParent = $(this).parent();
        inputParent.wrap('<div class="datepicker-wrapper">').addClass('datepicker-container');
        var inputWrapper = $(this).parents('.datepicker-wrapper');
        inputWrapper.css('display', 'inline-block');
        $('<span class="datepicker-label">' + settings.labelText + '</span>').prependTo(inputWrapper).css('cursor', 'pointer');
      }

      function createDatePicker() {
        var calendarObject = new MonthCalendar(settings.startYear, settings.startMonth);
        var calendarParent = $(this).parent();
        calendarParent.css('position', 'relative');
        $('<div class="datepicker"></div>').appendTo(calendarParent);
        var datePickerContainer = calendarParent.find('.datepicker');
        $('<div class="calendar-header"></div>').prependTo(datePickerContainer);
        $('<span class="visible-year"><span class="year-down date-control date-control-down"> < </span><span class="year-value">' +
          calendarObject.calendarYear +
          '</span><span class="year-up date-control date-control-up"> > </span></span>').prependTo(datePickerContainer.find('.calendar-header'));
        $('<span class="visible-month"><span class="month-down date-control date-control-down"> < </span><span class="month-value">' +
          calendarObject.calendarMonth +
          '</span><span class="month-up date-control date-control-up"> > </span></span>').appendTo(datePickerContainer.find('.calendar-header'));
        $('<div class="calendar-table">' + calendarObject.calendarBody + '</div>').appendTo(datePickerContainer);
        if(settings.dateRange) {
          calendarParent.css('float', 'left');
        } else {
          calendarParent.css('position', 'absolute');
          $(this).parent().hide();
        }
        calendarParent.find('.date-control').css('cursor', 'pointer');
        $(this).hide();
        $('label[for="' + $(this).attr('id') + '"]').hide();
      }

      function createDateRangePicker() {
        var initialDatePicker = $(this).parent();
        var dateRangePickerWrapper = $(this).parents('.datepicker-wrapper');
        initialDatePicker.clone().appendTo(dateRangePickerWrapper);
        var cloneDatePicker = initialDatePicker.next();
        var dateRangePickerItems = dateRangePickerWrapper.find('.datepicker-container');
        var initialDatePickerId = initialDatePicker.attr('id');
        var initialDateInput = initialDatePicker.children('input');
        var cloneDateInput = cloneDatePicker.children('input');
        var inputId = initialDatePicker.children('input').attr('id');
        dateRangePickerItems.wrapAll('<div class="date-range-picker">');
        var dateRangePicker = $('.date-range-picker');
        dateRangePicker.hide().css('position', 'absolute');
        if(initialDatePickerId.length) {
          initialDatePicker.attr('id', initialDatePickerId + '1');
          cloneDatePicker.attr('id', initialDatePickerId + '2');
        }
        if(inputId.length){
          cloneDateInput.attr('id', inputId + '-to');
        }
        cloneDatePicker.find('.date-control-down').addClass('date-control-disabled');
        initialDateInput.addClass('date-from');
        cloneDateInput.addClass('date-to');
        cloneDateInput.each(controlDatePicker);
        cloneDateInput.each(chooseDate);
      }

      function controlDatePicker() {
        var controlSwitcher = $(this).parent();

        //Enable datepicker controls

        controlSwitcher.on('click', '.year-down:not(.date-control-disabled)', {direction: false}, changeYear);
        controlSwitcher.on('click', '.year-up', {direction: true}, changeYear);
        controlSwitcher.on('click', '.month-down:not(.date-control-disabled)', {direction: false}, changeMonth);
        controlSwitcher.on('click', '.month-up', {direction: true}, changeMonth);
        function changeYear(event) {
          var yearValue = $(this).parent().find('.year-value');
          var currentMonthValue = $(this).parents('.calendar-header').find('.month-value');
          var calendarTable = $(this).parents('.calendar-header').next();
          var calendarObject;
          calendarObject = shiftDate({
            year: yearValue.text(),
            month: getMonthIndex(currentMonthValue.text()),
            shiftYear: true,
            direction: event.data.direction
          });
          yearValue.text(calendarObject.calendarYear);
          calendarTable.html(calendarObject.calendarBody);
          if(settings.dateRange) {
            var calendarFrom = $(this).parents('.date-range-picker').find('.date-from').parent();
            var calendarTo = $(this).parents('.date-range-picker').find('.date-to').parent();
            var calendarYearFrom = calendarFrom.find('.year-value');
            var calendarYearTo = calendarTo.find('.year-value');
            var calendarMonthFrom = calendarFrom.find('.month-value');
            var calendarMonthTo = calendarTo.find('.month-value');
            var calendarTableTo = calendarTo.find('.calendar-table');
            var switcherDown = calendarTo.find('.date-control-down');
            if(calendarYearFrom.text() >= calendarYearTo.text()) {
              switcherDown.addClass('date-control-disabled');
              var controlledCalendar = shiftDate({
                year: calendarYearFrom.text() - 1,
                  month: getMonthIndex(calendarMonthFrom.text()),
                  shiftYear: true,
                  direction: true
              });
              calendarYearTo.text(controlledCalendar.calendarYear);
              calendarMonthTo.text(controlledCalendar.calendarMonth);
              calendarTableTo.html(controlledCalendar.calendarBody);
              } else {
                switcherDown.removeClass('date-control-disabled');
              }
            }
          }

          function changeMonth(event) {
            var monthValue = $(this).parent().find('.month-value');
            var yearValue = $(this).parents('.calendar-header').find('.year-value');
            var calendarTable = $(this).parents('.calendar-header').next();
            var calendarObject = shiftDate({
              year: yearValue.text(),
              month: getMonthIndex(monthValue.text()),
              shiftMonth: true,
              direction: event.data.direction
            });
            monthValue.text(calendarObject.calendarMonth);
            yearValue.text(calendarObject.calendarYear);
            calendarTable.html(calendarObject.calendarBody);
            if(settings.dateRange) {
              if($(this).parents('.datepicker').prev().hasClass('date-from')) {
                var controlCalendar = $(this).parents('.datepicker-container').next();
                var controlMonthValue = controlCalendar.find('.month-value');
                var controlYearValue = controlCalendar.find('.year-value');
                var controlCalendarTable = controlCalendar.find('.calendar-table');
                var initialMonthIndex = getMonthIndex(monthValue.text());
                var controlMonthIndex = getMonthIndex(controlMonthValue.text());
                var correction = 0;
                if(initialMonthIndex === 0) {
                  correction = 1;
                }
                if((initialMonthIndex > controlMonthIndex && yearValue.text() === controlYearValue.text()) ||
                  correction && yearValue.text() > controlYearValue.text()) {
                  var controlCalendarObject = shiftDate({
                    year:  controlYearValue.text(),
                    month: controlMonthIndex,
                    shiftMonth: true,
                    direction: true
                  });
                  controlMonthValue.text(controlCalendarObject.calendarMonth);
                  controlYearValue.text(controlCalendarObject.calendarYear);
                  controlCalendarTable.html(controlCalendarObject.calendarBody);
                }
              }
            }
            var initialCalendar = $(this).parents('.date-range-picker').find('.date-from').parent();
            var startMonthIndex = getMonthIndex(initialCalendar .find('.month-value').text());
            var cloneCalendar = $(this).parents('.date-range-picker').find('.date-to').parent();
            var cloneMonthIndex = getMonthIndex(cloneCalendar.find('.month-value').text());
            var initialYearValue = initialCalendar.find('.year-value').text();
            var cloneYearValue = cloneCalendar.find('.year-value').text();
            var switcherDown = cloneCalendar.find('.month-down');
            if(startMonthIndex >= cloneMonthIndex && initialYearValue === cloneYearValue) {
              switcherDown.addClass('date-control-disabled');
            } else {
              switcherDown.removeClass('date-control-disabled');
            }
        }

        function refreshMonthIndex(year, month) {
          if(month === 0) {
            month += 12;
            year--;
          } else if(month === 13) {
            month -= 12;
            year++;
          }
          return [year, month];
        }

        function shiftDate(shiftSettings) {
          shiftSettings.month++;
          var refreshedDate;
          if(shiftSettings.shiftYear) {
            if(shiftSettings.direction) {
              shiftSettings.year++;
            } else {
              shiftSettings.year--;
            }
          } else {
            if(shiftSettings.direction) {
              shiftSettings.month++;
              refreshedDate = refreshMonthIndex(shiftSettings.year, shiftSettings.month);
              shiftSettings.year = refreshedDate[0];
              shiftSettings.month = refreshedDate[1];
            } else {
              shiftSettings.month--;
              refreshedDate = refreshMonthIndex(shiftSettings.year, shiftSettings.month);
              shiftSettings.year = refreshedDate[0];
              shiftSettings.month = refreshedDate[1];
            }
          }
          return new MonthCalendar(shiftSettings.year, shiftSettings.month);
        }

        function getMonthIndex(monthString) {
          for(var monthIndex = 0; monthIndex < monthes[settings.lang].length; monthIndex++) {
            if(monthString === monthes[settings.lang][monthIndex]) {
              break;
            }
          }
          return monthIndex;
        }
      }

      function chooseDate() {
        var calendarTable = $(this).parent().find('.calendar-table');
        var monthValue = $(this).parent().find('.month-value');
        var yearValue = $(this).parent().find('.year-value');
        calendarTable.on('click', 'td:not(.not-current-month, .disabled-day)', function() {
          var chosenYear = yearValue.text();
          var chosenMonth = monthValue.text();
          var chosenDay = $(this).text();
          var dateInput = $(this).parents('.datepicker').prevAll('input');
          var chosenMonthIndexString;
          var calendarLabel = $(this).parents('.datepicker-wrapper').children('.datepicker-label');
          var monthList = monthes[settings.lang];
          for(var chosenMonthIndex = 0; chosenMonthIndex < monthList.length; chosenMonthIndex++) {
            if(chosenMonth === monthList[chosenMonthIndex]) {
              chosenMonthIndexString = chosenMonthIndex + 1;
               break;
            }
          }
          chosenMonthIndexString = addZero(chosenMonthIndexString);
          chosenDay = addZero(chosenDay);
          dateInput.val(chosenYear + '-' + chosenMonthIndexString + '-' + chosenDay);
          var dateLit = chosenDay + ' ' + chosenMonth + ' ' + chosenYear;

              /*Display chosen date range or single date (if !settings.dateRange)*/

          if(settings.dateRange) {
            if(calendarLabel.text() === settings.labelText) {
              calendarLabel.html('<span class="label-from"></span>');
              $('<span class="label-to"></span>').appendTo(calendarLabel);
            }
            var labelFrom = calendarLabel.children('.label-from');
            var labelTo = calendarLabel.children('.label-to');
            if(dateInput.hasClass('date-from')) {
              labelFrom.text(dateLit);
              addSeparator(labelTo, labelFrom);
            } else if(dateInput.hasClass('date-to')){
              labelTo.text(dateLit);
              addSeparator(labelFrom, labelFrom);
            }

            if(dateInput.hasClass('date-from')) {
              var cloneCalendar = dateInput.parents('.date-range-picker').find('.date-to').parent();
              var cloneCalendarCells = cloneCalendar.find('td:not(.not-current-month)');
              var cloneYearText = cloneCalendar.find('.year-value').text();
              var cloneMonthText = cloneCalendar.find('.month-value').text();
              if(cloneYearText === chosenYear && cloneMonthText === chosenMonth) {
                for(var cell = 0; cell < cloneCalendarCells.length; cell++) {
                  if(cloneCalendarCells.eq(cell).text() < $(this).text()) {
                    cloneCalendarCells.eq(cell).addClass('disabled-day');
                  } else {
                    cloneCalendarCells.eq(cell).removeClass('disabled-day');
                  }
                }
              }
            }
          } else {
            calendarLabel.text(dateLit);
          }

          function addSeparator(verifiable, editable) {
            var labelSeparatorString = '<span class="calendar-label-separator"> - </span>';
            var labelSeparator = editable.nextAll('.calendar-label-separator');
            if(verifiable.text() && !labelSeparator.text()) {
              editable.after(labelSeparatorString);
            }
          }
          function addZero(number) {
            if(number < 10) {
              return '0' + number.toString();
            } else {
              return number.toString();
            }
          }
        });
      }

      function toggleDatePicker() {
        var label = $(this).parents('.datepicker-wrapper').children('.datepicker-label');
        var datePicker = label.next();
        label.click(function() {
          datePicker.fadeToggle('fast');
          datePicker.toggleClass('expanded');
        });
        $(document).click(function(event) {
          if($(event.target).closest('.datepicker-wrapper').length) {
            return;
          }
          if(datePicker.hasClass('expanded')) {
            datePicker.removeClass('expanded');
            datePicker.fadeOut('fast');
          }
          event.stopPropagation();
        });
      }

      //Calendar object constructor

      function MonthCalendar(year, month) {
        var monthIndex = month - 1;
        var currentDate = new Date(year, monthIndex);
        var calendarTable = '<table><tr><th>пн</th><th>вт</th><th>ср</th><th>чт</th>' +
          '<th>пт</th><th>сб</th>' +
          '<th>вс</th></tr><tr>';
        for(var i = 0, j = getCurrentDay(currentDate) - 1; i < getCurrentDay(currentDate); i++, j--) {
          var beforeMonObj = new Date(year, monthIndex, -j);
          calendarTable +='<td class="not-current-month">' + beforeMonObj.getDate() + '</td>';
        }
        var daysInMonth = 1;
        while(currentDate.getMonth() === monthIndex) {
          calendarTable += '<td>' + currentDate.getDate() + '</td>';
          if(getCurrentDay(currentDate) % 7 === 6) {
            calendarTable += '<tr></tr>';
          }
          currentDate.setDate(currentDate.getDate() + 1);
          daysInMonth++;
        }
        if (getCurrentDay(currentDate)) {
          for (i = getCurrentDay(currentDate); i < 7; i++, daysInMonth++) {
            var afterMonObj = new Date(year, monthIndex, daysInMonth);
            calendarTable += '<td class="not-current-month">' + afterMonObj.getDate() + '</td>';
          }
        }
        function getCurrentDay(date) {
          var day = date.getDay();
          if (day === 0) day = 7;
            return day - 1;
          }
        var monthLocal = monthes[settings.lang][monthIndex];
        this.calendarYear = year;
        this.calendarMonth = monthLocal;
        this.calendarBody = calendarTable;
      }
  };

})(jQuery);