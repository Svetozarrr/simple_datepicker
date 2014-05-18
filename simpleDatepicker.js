(function ($) {

    $.fn.simpleDatepicker = function(options) {
        var settings = $.extend({}, {
            startYear: new Date().getFullYear(),
            startMonth: new Date().getMonth() + 1
        }, options);

        return this.each(function(){
            if ($(this).is('input[type="date"]')) {
                $(this).each(createDatePicker);
                $(this).each(toggleDatePicker);
                $(this).each(controlDatePicker);
                $(this).each(chooseDate);
            } else {
                console.error('Illegal choice');
            }
        });

        function createDatePicker() {
            var calendarObject = new MonthCalendar(settings.startYear, settings.startMonth);
            var calendarWrapper = $(this).parent();
            calendarWrapper.addClass('datepicker-wrapper').css('display', 'inline-block');
            calendarWrapper.css('position', 'relative');
            $('<div class="datepicker"></div>').appendTo(calendarWrapper);
            var datePickerContainer = calendarWrapper.find('.datepicker');
            $('<div class="calendar-header"></div>').prependTo(datePickerContainer);
            $('<span class="visible-year"><span class="year-down date-control"> < </span><span class="year-value">'
                + calendarObject.createTable().calendarYear
                + '</span><span class="year-up date-control"> > </span></span>').prependTo(datePickerContainer.find('.calendar-header'));

            $('<span class="visible-month"><span class="month-down date-control"> < </span><span class="month-value">'
                + calendarObject.createTable().calendarMonth
                + '</span><span class="month-up date-control"> > </span></span>').appendTo(datePickerContainer.find('.calendar-header'));
            $('<div class="calendar-table">' + calendarObject.createTable().calendarBody + '</div>').appendTo(datePickerContainer);
            calendarWrapper.find(".datepicker").css('position', 'absolute').hide();
            calendarWrapper.find('.date-control').css('cursor', 'pointer');
            $(this).hide();
        }

        function controlDatePicker() {
            var calendarObject = new MonthCalendar(settings.startYear, settings.startMonth);
            var yearStep = 0;
            var monthStep = 0;
            var yearDown = $(this).parent().find('.year-down');
            var yearUp = $(this).parent().find('.year-up');
            var monthDown = $(this).parent().find('.month-down');
            var monthUp = $(this).parent().find('.month-up');

            //Enable datepicker controls

            yearDown.click({direction: false}, changeYear);
            yearUp.click({direction: true}, changeYear);
            monthDown.click({direction: false}, changeMonth);
            monthUp.click({direction: true}, changeMonth);

            function changeYear(event) {
                var yearValue = $(this).parent().find('.year-value');
                var calendarTable = $(this).parents('.calendar-header').next();
                if(event.data.direction) {
                    yearStep++;
                    var currentCalendar = calendarObject.createTable(yearStep, monthStep);
                    yearValue.text(currentCalendar.calendarYear);
                    calendarTable.html(currentCalendar.calendarBody);
                } else {
                    yearStep--;
                    currentCalendar = calendarObject.createTable(yearStep, monthStep);
                    yearValue.text(currentCalendar.calendarYear);
                    calendarTable.html(currentCalendar.calendarBody);
                }
            }
            function changeMonth(event) {
                var monthValue = $(this).parent().find('.month-value');
                var yearValue = $(this).parent().find('.year-value');
                var calendarTable = $(this).parents('.calendar-header').next();
                if(event.data.direction) {
                    monthStep++;
                    var currentCalendar = calendarObject.createTable(yearStep, monthStep);
                    refreshMonthIndex(currentCalendar.calendarMonthIndex);
                    currentCalendar = calendarObject.createTable(yearStep, monthStep);
                    monthValue.text(currentCalendar.calendarMonth);
                    yearValue.text(currentCalendar.calendarYear);
                    calendarTable.html(currentCalendar.calendarBody);
                } else {
                    monthStep--;
                    currentCalendar = calendarObject.createTable(yearStep, monthStep);
                    refreshMonthIndex(currentCalendar.calendarMonthIndex);
                    currentCalendar = calendarObject.createTable(yearStep, monthStep);
                    monthValue.text(currentCalendar.calendarMonth);
                    yearValue.text(currentCalendar.calendarYear);
                    calendarTable.html(currentCalendar.calendarBody);
                }
            }
            function refreshMonthIndex(index) {
                if(index === -1) {
                    monthStep += 12;
                    yearStep--;
                } else if(index === 12) {
                    monthStep -= 12;
                    yearStep++;
                }
            }
        }



        function chooseDate() {
            var calendarTable = $(this).parent().find('.calendar-table');
            var monthValue = $(this).parent().find('.month-value');
            var yearValue = $(this).parent().find('.year-value');
            calendarTable.on('click', 'td:not(.not-current-month)', function() {
                var chosenYear = yearValue.text();
                var chosenMonth = monthValue.text();
                var chosenDay = $(this).text();
                var dateInput = $(this).parents('.datepicker').prevAll('input');
                console.log(dateInput);
                var chosenMonthIndex;
                var monthList = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
                for(var i = 0; i < monthList.length; i++) {
                    if(chosenMonth === monthList[i]) {
                        chosenMonthIndex = i + 1;
                        break;
                    }
                }
                chosenMonthIndex = addZero(chosenMonthIndex);
                chosenDay = addZero(chosenDay);
                dateInput.val(chosenYear + '-' + chosenMonthIndex + '-' + chosenDay);

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
            var label = $('label[for="' + $(this).attr('id') + '"]');
            var datePicker = label.next();
            label.css('cursor', 'pointer');
            label.click(function() {
                $(this).next().fadeToggle('fast');
                $(this).next().toggleClass('expanded');
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
            })
        }

        //Calendar object constructor

        function MonthCalendar(year, month) {
            this.year = year;
            var startMonthIndex = month - 1;
            this.createTable = function(stepYear, stepMonth) {
                if(!stepYear) {
                    stepYear = 0;
                }
                if(!stepMonth) {
                    stepMonth = 0;
                }
                var currentMonthIndex = startMonthIndex + stepMonth;
                var currentYear = this.year + stepYear;
                var currentDate = new Date(currentYear, currentMonthIndex);
                var calendarTable = '<table><tr><th>пн</th><th>вт</th><th>ср</th><th>чт</th>' +
                    '<th>пт</th><th>сб</th>' +
                    '<th>вс</th></tr><tr>';
                for(var i = 0, j = getCurrentDay(currentDate) - 1; i < getCurrentDay(currentDate); i++, j--) {
                    var beforeMonObj = new Date(currentYear, currentMonthIndex, -j);
                    calendarTable +='<td class="not-current-month">' + beforeMonObj.getDate() + '</td>';
                }

                var daysInMonth = 1;

                while(currentDate.getMonth() === currentMonthIndex) {
                    calendarTable += '<td>' + currentDate.getDate() + '</td>';
                    if(getCurrentDay(currentDate) % 7 === 6) {
                        calendarTable += '<tr></tr>'
                    }
                    currentDate.setDate(currentDate.getDate() + 1);
                    daysInMonth++;
                }

                if (getCurrentDay(currentDate)) {
                    for (i = getCurrentDay(currentDate); i < 7; i++, daysInMonth++) {
                        var afterMonObj = new Date(currentYear, currentMonthIndex, daysInMonth);
                        calendarTable += '<td class="not-current-month">' + afterMonObj.getDate() + '</td>';
                    }
                }

                function getCurrentDay(date) {
                    var day = date.getDay();
                    if (day === 0) day = 7;
                    return day - 1;
                }
                var monthesRu = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
                var monthLocal = monthesRu[currentMonthIndex];
                return {
                    calendarYear: currentYear,
                    calendarMonth: monthLocal,
                    calendarMonthIndex: currentMonthIndex,
                    calendarBody: calendarTable
                }
            }
        }
    }

})(jQuery);