(function ($) {

    $.fn.simpleDatepicker = function(options) {
        var settings = $.extend({}, {
            startYear: new Date().getFullYear(),
            startMonth: new Date().getMonth() + 1
        });

        return this.each(function(){
            if ($(this).is('input[type="date"]')) {
                $(this).each(createDatePicker);
                $(this).each(controlDatePicker);
                $(this).each(chooseDate);
            } else {
                console.error('Illegal choice');
            }
        });


        function controlDatePicker() {
            var calendar = new MonthCalendar(settings.startYear, settings.startMonth);
            var yearStep = 0;
            var monthStep = 0;

            //Enable datepicker controls

            $('.year-down').click(function() {
                changeYear(false);
            });
            $('.year-up').click(function() {
                changeYear(true);
            });
            $('.month-down').click(function() {
                changeMonth(false);
            });
            $('.month-up').click(function() {
                changeMonth(true);
            });

            //Set the date input value by click

            function changeYear(direction) {
                if(direction) {
                    yearStep++;
                    var currentCalendar = calendar.createTable(yearStep, monthStep);
                    $('.year-value').text(currentCalendar.calendarYear);
                    $('#calendar-table').html(currentCalendar.calendarBody);
                } else {
                    yearStep--;
                    currentCalendar = calendar.createTable(yearStep, monthStep);
                    $('.year-value').text(currentCalendar.calendarYear);
                    $('#calendar-table').html(currentCalendar.calendarBody);
                }
            }
            function changeMonth(direction) {
                if(direction) {
                    monthStep++;
                    var currentCalendar = calendar.createTable(yearStep, monthStep);
                    refreshMonthIndex(currentCalendar.calendarMonthIndex);
                    currentCalendar = calendar.createTable(yearStep, monthStep);
                    $('.month-value').text(currentCalendar.calendarMonth);
                    $('.year-value').text(currentCalendar.calendarYear);
                    $('#calendar-table').html(currentCalendar.calendarBody);
                } else {
                    monthStep--;
                    currentCalendar = calendar.createTable(yearStep, monthStep);
                    refreshMonthIndex(currentCalendar.calendarMonthIndex);
                    currentCalendar = calendar.createTable(yearStep, monthStep);
                    $(this).next().text(currentCalendar.calendarMonth);
                    $('.year-value').text(currentCalendar.calendarYear);
                    $('#calendar-table').html(currentCalendar.calendarBody);
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

        function createDatePicker() {
            var calendar = new MonthCalendar(settings.startYear, settings.startMonth);
            var calendarWrapper = $(this).parent();

            $('<div id="datepicker"></div>').appendTo(calendarWrapper);
            var datePickerContainer = $('#datepicker');
            $('<div class="calendar-header"></div>').prependTo(datePickerContainer);
            $('<span class="visible-year"><span class="year-down"> < </span><span class="year-value">'
                + calendar.createTable().calendarYear
                + '</span><span class="year-up"> > </span></span>').prependTo('.calendar-header');

            $('<span class="visible-month"><span class="month-down"> < </span><span class="month-value">'
                + calendar.createTable().calendarMonth
                + '</span><span class="month-up"> > </span></span>').appendTo('.calendar-header');
            $('<div id="calendar-table">' + calendar.createTable().calendarBody + '</div>').appendTo(datePickerContainer);
            //calendarTableInner = $('#calendar-table');
        }

        function chooseDate() {
            $('#calendar-table').on('click', 'td:not(.not-current-month)', function() {
                var chosenYear = $('.year-value').text();
                var chosenMonth = $('.month-value').text();
                var chosenDay = $(this).text();
                var dateInput = $(this).parents('#datepicker').prev();
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
            });
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
                return calendar = {
                    calendarYear: currentYear,
                    calendarMonth: monthLocal,
                    calendarMonthIndex: currentMonthIndex,
                    calendarBody: calendarTable
                }
            }
        }

        function addZero(number) {
            if(number < 10) {
                return '0' + number.toString();
            } else {
                return number.toString();
            }
        }
    }

})(jQuery);