$(function() {

$exportButtons = $('button.export-btn');

// bind long-lived export button clicks
$exportButtons.click(function () {

  $this = $(this);

  // disable buttons
  $exportButtons.prop('disabled', true);

  // relabel this button
  $this.attr('data-label', $this.text());
  $this.text('Processing... please wait');

  // create spinner
  // (necessary because animated gifs are stopped by the change to window.location)
  $('#export-wait-message').show();
  new Spinner({
      lines: 13, // The number of lines to draw
      length: 8, // The length of each line
      width: 2, // The line thickness
      radius: 8, // The radius of the inner circle
      corners: 1, // Corner roundness (0..1)
      rotate: 0, // The rotation offset
      direction: 1, // 1: clockwise, -1: counterclockwise
      color: '#000', // #rgb or #rrggbb or array of colors
      speed: 1, // Rounds per second
      trail: 60, // Afterglow percentage
      shadow: false, // Whether to render a shadow
      hwaccel: true, // Whether to use hardware acceleration
      className: 'spinner', // The CSS class to assign to the spinner
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      top: 6, // Top position relative to parent in px
      left: -48 // Left position relative to parent in px
  }).spin($('#export-spinner')[0]);

  // request export and begin polling
  $.ajax({
      url: '/export_bulk',
      type: 'POST',
      data: {
        download: $this.attr('value'),
        id_list: $('.id_list').val()
      }
    }).done(function(data) {
      pollForCSVDownload(
        data.filename,
        function() {
          $exportButtons.prop('disabled', false);
          $exportButtons.each(function(idx, el) {
              $el = $(el);
              if ($el.attr('data-label')) {
                  $el.text($el.attr('data-label'));
              }
          });
          $('#export-wait-message').hide();
        }
    );
    });

  // prevent default
  return false;
});


// bind download all button
$exportAllButton = $('button.all-export-btn');

$exportAllButton.click(function() {
    $('iframe#file-download-target')[0].src = '/export_all_download';
    return false;  // prevent default
});
  
});
