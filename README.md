simple_datepicker
=================

Lightweight datepicker with separate year and month changing, based on jQuery and HTML5

*How to use

 - Download latest release of plugin and jQuery library and add it between <head></head> tags of your HTML-file;
 - In body of the HTML-file create div with input[type="date"] (important!) inside and associated label after this input. 
 
 example:
 
 <div class="example">
    <input id="some-date-input" type="date">
    <label for="some-date-input">Choose Date</label>
 </div>
 
 
- Initialize plugin:

    $('#some-date-input').simpleDatepicker();
    
    
=============================================================================================================================

*Options

You can set the month and year, that will be show first (by default use current date).

    $('#some-date-input').simpleDatepicker({
        startYear: 1967                               //Set default year
    });
    
    $('#some-date-input').simpleDatepicker({
        startMonth: 6                               //Set default month (just use a month number)
    });
    
    $('#some-date-input').simpleDatepicker({
        startYear: 1967, 
        startMonth: 6                               //Set default month and year
    });
    
==========================================================================================================================

*Localization

Plugin support only russian names of monthes. Localization option will be added soon
