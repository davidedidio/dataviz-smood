class Story{

  constructor(){
    this.popups = [
      {
        text:"Each circle represents a restaurant.",
        latlng: L.latLng(46.52672, 6.638082),
        action: null
      },{
        text:"Each colored line represents a path used for some delivery. Its color represents the number of deliveries that have gone through that path.",
        latlng: L.latLng(46.528044, 6.587162),
        action: "null"
      },{
        text:"This is the last popup.",
        latlng: L.latLng(46.528733, 6.663895),
        action: "heatmap.show_roads_with_ids([2])"
      },
    ];
    this.nb_popups = this.popups.length;
    this.template = `
      <h6>Tutorial</h6>
      <span class='story-state'>$popup_idx$/${this.nb_popups}</span>
      <button type="button" onclick="story.next_popup()" id="story-next-btn" class="btn btn-primary">Next<i class="fas fa-arrow-right icon-right"></i></button>
      <button type="button" onclick="heatmap.mymap.closePopup()" id="story-skip-btn" class="btn btn-link">Skip</button>
      <p>$text$</p>
      `
    this.template_last = `
      <h6>Tutorial</h6>
      <span class='story-state'>$popup_idx$/${this.nb_popups}</span>
      <button type="button" onclick="heatmap.mymap.closePopup()" id="story-next-btn" class="btn btn-primary">Ok, got it!</button>
      <p>$text$</p>
      `

    this.popup_options = {
      'className': 'custom-popup',
      'keepInView': true,
      'maxWidth': 300,
      'minWidth': 250,
      'closeButton': false
    };

    $('#start-tutorial').click(() => {
      this.start_story();
      $('#start-tutorial').css('display', 'none');
    });
    
  }

  start_story(){
    this.popup_idx = 0;
    this.next_popup()
  }

  next_popup(){
    if (this.popup_idx < this.nb_popups){
      // display the next popup
      let latlng = this.popups[this.popup_idx].latlng;
      let text = this.popups[this.popup_idx].text;
      let action = this.popups[this.popup_idx].action;
      let template = null;

      if (this.popup_idx+1 == this.nb_popups) {
        // if this is the last popup, use a specific template
        template = this.template_last;
      } else {
        template = this.template;
      }

      this.show_popup(latlng, text, template, action);
      this.popup_idx += 1;
    } else {
      // Story is finished
      heatmap.mymap.closePopup()
    }
  }

  show_popup(latlng, text, template=null, action=null){
    let content = null;
    if (template==null){
      content = text;
    }else{
      content = template;
      content = content.replace('$text$', text);
      content = content.replace('$popup_idx$', this.popup_idx+1);
    }

    L.popup(this.popup_options)
      .setLatLng(latlng)
      .setContent(content)
      .openOn(heatmap.mymap);

    eval(action);
  }

}

