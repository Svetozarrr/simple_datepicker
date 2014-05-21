(function ($) {

    $.fn.simpleDatepicker = function(options) {
        var settings = $.extend({}, {
            startYear: new Date().getFullYear(),
            startMonth: new Date().getMonth() + 1,
            labelText: 'Choose a date',
            dateRange: false
        }, options);

        return this.each(function(){
            if ($(this).is('input[type="date"]')) {
                $(this).each(createDatePickerWrapper);
                $(this).each(createDatePicker);
                if(settings.dateRange) {
                    $(this).each(createDateRangePicker)
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
            $('<span class="visible-year"><span class="year-down date-control"> < </span><span class="year-value">'
                + calendarObject.calendarYear
                + '</span><span class="year-up date-control"> > </span></span>').prependTo(datePickerContainer.find('.calendar-header'));
            $('<span class="visible-month"><span class="month-down date-control"> < </span><span class="month-value">'
                + calendarObject.calendarMonth
                + '</span><span class="month-up date-control"> > </span></span>').appendTo(datePickerContainer.find('.calendar-header'));
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
            initialDateInput.addClass('date-from');
            cloneDateInput.addClass('date-to');
            cloneDateInput.each(controlDatePicker);
            cloneDateInput.each(chooseDate);

        }

        function controlDatePicker() {
            //var calendarObject = new MonthCalendar(settings.startYear, settings.startMonth);
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
                var calendarObject;
                if(event.data.direction) {
                    yearStep++;
                    calendarObject = shiftDate(yearStep ,monthStep);
                    yearValue.text(calendarObject.calendarYear);
                    calendarTable.html(calendarObject.calendarBody);
                } else {
                    yearStep--;
                    calendarObject = shiftDate(yearStep, monthStep);
                    yearValue.text(calendarObject.calendarYear);
                    calendarTable.html(calendarObject.calendarBody);
                }
            }
            function changeMonth(event) {
                var monthValue = $(this).parent().find('.month-value');
                var yearValue = $(this).parents('.calendar-header').find('.year-value');
                var calendarTable = $(this).parents('.calendar-header').next();
                var calendarObject;
                if(event.data.direction) {
                    monthStep++;
                    calendarObject = shiftDate(yearStep, monthStep);
                    refreshMonthIndex(calendarObject.calendarMonthIndex);
                    calendarObject = shiftDate(yearStep, monthStep);
                    monthValue.text(calendarObject.calendarMonth);
                    yearValue.text(calendarObject.calendarYear);
                    calendarTable.html(calendarObject.calendarBody);
                } else {
                    monthStep--;
                    calendarObject = shiftDate(yearStep, monthStep);
                    refreshMonthIndex(calendarObject.calendarMonthIndex);
                    calendarObject = shiftDate(yearStep, monthStep);
                    monthValue.text(calendarObject.calendarMonth);
                    yearValue.text(calendarObject.calendarYear);
                    calendarTable.html(calendarObject.calendarBody);
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
            function shiftDate(yearShift, monthShift) {
                return new MonthCalendar(settings.startYear + yearShift, settings.startMonth + monthShift);
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
                var chosenMonthIndex;
                var calendarLabel = $(this).parents('.datepicker-wrapper').children('.datepicker-label');
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
                        addSeparator(labelTo,labelFrom);
                    } else if(dateInput.hasClass('date-to')){
                        labelTo.text(dateLit);
                        addSeparator(labelFrom, labelFrom);
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
            })
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
                    calendarTable += '<tr></tr>'
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
            var monthesRu = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
            var monthLocal = monthesRu[monthIndex];

            this.calendarYear = year;
            this.calendarMonth = monthLocal;
            this.calendarMonthIndex = monthIndex;
            this.calendarBody = calendarTable;
        }
    }

})(jQuery);