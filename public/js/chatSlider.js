$(document).ready(function() {
  $(document).on('click', '#chat-icon-container', function() {
    const $this = $(this);
    $this.animate({
      bottom: '-=250px',
      opacity: '0.3'
    }, 'slow');
    $('.chat-wrapper').animate({
      bottom: '+=1000px',
      opacity: '1'
    }, 'slow');
  });

  $(document).on('click', '.fa-times-circle', function() {
    $('.chat-wrapper').animate({
      bottom: '-=1000px',
      opacity: '0.3'
    }, 'slow');
    $('#chat-icon-container').animate({
      bottom: '+=250px',
      opacity: '1'
    }, 'slow');
  });
});
