class Clock{

  constructor(data){
    this.data = data
    this.is_playing = false;
    this.index = 0;
    $('button#start-button').click(() => {
      if (this.is_playing == true){
        this.stop_animation();
      }else{
        this.is_playing = true;
        $('#start-button svg').attr('data-icon', 'pause');
        $('#navbar-reset').attr('disabled', true);
        $('#navbar-reset').addClass('disabled')
        this.slider.disabled(true);
        heatmap.set_road_ids([...Array(2000).keys()]);

        let vals = this.slider.getValue();
        let times = data.map((x) => x.time);
        let v = vals.split(",")
        this.index = times.indexOf(v[0])

        if(this.index == data.length - 1){
          this.index = 0;
        }

        this.intervalLoop();
        this.interval = setInterval(() => {
          if(!$('.rs-pointer').hasClass("playing_animation")){
            $('.rs-pointer').addClass("playing_animation")
            $('.rs-selected').addClass("playing_animation")
          }
          this.intervalLoop();
        }, 900);
      }
  	});

    this.slider = new rSlider({
      target: '#time-range',
      values: this.data.map((x) => x["time"]),
      range: true,
      tooltip: false,
      scale: true,
      labels: true,
      onChange: function (vals) {
        let ids = [];
        let times = data.map((x) => x.time);
        let v = vals.split(",")
        let sliced_data = data.slice(times.indexOf(v[0]), 1+times.indexOf(v[1]))
        sliced_data.forEach((x) => ids.push(...x.ids))

        heatmap.set_time_ids(ids)
        heatmap.update_map();
      }
    });

  }

  intervalLoop(){
    this.setCaptions(this.data[this.index].time)

    this.index++;
    if(this.index > this.data.length-1){
      this.stop_animation();
    }
  }

  stop_animation(){
    this.is_playing = false;
    this.slider.disabled(false);
    $('#navbar-reset').attr('disabled', false);
    $('#navbar-reset').removeClass('disabled')
    $('#start-button svg').attr('data-icon', 'play');
    $('.rs-pointer').removeClass("playing_animation");
    $('.rs-selected').removeClass("playing_animation");
    clearInterval(this.interval);
  }

  setCaptions(time) {
    this.slider.setValues(time, time)
  };

}
