class Story{

  constructor(){
    this.popups = [
      {
        text:"Smood is company that allows you to order your meal at restaurants near you and get them delivered to your home.",
        latlng: L.latLng(46.54540254050101, 6.635227203369141),
        action: "null",
        class: "popup-notip"
      },{
        text:"This visualisation explores the itineraries taken for deliveries made in the Lausanne area.",
        latlng: L.latLng(46.54540254050101, 6.635227203369141),
        action: "null",
        class: "popup-notip"
      },{
        text:"Each circle represents a restaurant.",
        latlng: L.latLng(46.52672, 6.638082),
        action: "null"
      },{
        text:"The number of deliveries along any road is represented by a color map.",
        latlng: L.latLng(46.54540254050101, 6.635227203369141),
        action: "null",
        class: "popup-notip"
      },{
        text:"By clicking on a road, one can select all deliveries that go through it. Try it by yourself!!",
        latlng: L.latLng(46.54268697331455, 6.589221954345704),
        action: "null",
        class: "popup-notip"
      },{
        text:"We can for example see that the most popular delivery is the one from Rue du Flon, in the center of Lausanne, to La Vulliette, near the École Hôtelière.",
        latlng: L.latLng(46.55549340867392, 6.666869893670083),
        action: "heatmap.set_road_ids([2]);heatmap.update_map();"
      },{
        text:"Similarly, we can click on any restaurant to select all deliveries from there.",
        latlng: L.latLng(46.54268697331455, 6.589221954345704),
        action: "heatmap.set_road_ids([...Array(2000).keys()]);heatmap.update_map();",
        class: "popup-notip"
      },{
        text:"We can for example see that the most popular restaurant has food delivered all over Lausanne.",
        latlng: L.latLng(46.54540254050101, 6.635227203369141),
        action: "heatmap.set_selected_restaurants([0]);heatmap.set_road_ids(heatmap.r_data[0].road_ids);heatmap.update_map();",
        class: "popup-notip"
      },{
        text:"You can either select a specific time range, or show an animation of the deliveries along the day with the time bar below.",
        latlng: L.latLng(46.49342900178936, 6.636600494384766),
        action: "heatmap.set_selected_restaurants([]);heatmap.set_road_ids([...Array(2000).keys()]);heatmap.update_map();"
      },{
        text:"For any selection, further insights are shown in the sidebar on the left.",
        latlng: L.latLng(46.54268697331455, 6.589221954345704),
        action: "null",
        class: "popup-tip-left"
      },{
        text:"That’s it, now you can explore the data by yourself!",
        latlng: L.latLng(46.54540254050101, 6.635227203369141),
        action: "null",
        class: "popup-notip"
      }
    ];
    this.nb_popups = this.popups.length;
    this.template = `
      <h6>Story</h6>
      <span class='story-state'>$popup_idx$/${this.nb_popups}</span>
      <button type="button" onclick="story.next_popup()" id="story-next-btn" class="btn btn-primary">Next<i class="fas fa-arrow-right icon-right"></i></button>
      <button type="button" onclick="heatmap.mymap.closePopup()" id="story-skip-btn" class="btn btn-link">Skip</button>
      <p>$text$</p>
      `
    this.template_last = `
      <h6>Story</h6>
      <span class='story-state'>$popup_idx$/${this.nb_popups}</span>
      <button type="button" onclick="heatmap.mymap.closePopup()" id="story-next-btn" class="btn btn-primary">Ok, got it!</button>
      <p>$text$</p>
      `

    this.popup_options = {
      'className': 'custom-popup',
      'keepInView': true,
      'maxWidth': 300,
      'minWidth': 250,
      'closeButton': false,
      'autoPanPadding': L.point(60,60),
      'closeOnClick': false
    };

    $('#start-story').click(() => {
      this.start_story();
      $('#start-story').css('display', 'none');
    });

    $('#about-start-story').click(() => {
      $('#about-modal').modal('hide');
      $('#start-story').css('display', 'none');
      window.setTimeout(() => {this.start_story()}, 300);
    });
    
  }

  start_story(){
    this.popup_idx = 0;
    this.next_popup()
  }

  next_popup(){
    if (this.popup_idx < this.nb_popups){
      // display the next popup
      let popup = this.popups[this.popup_idx]
      let latlng = popup.latlng;
      let text = popup.text;
      let action = popup.action;
      let template = null;

      if (this.popup_idx+1 == this.nb_popups) {
        // if this is the last popup, use a specific template
        template = this.template_last;
      } else {
        template = this.template;
      }

      let popup_options = $.extend({}, this.popup_options);;
      console.log('class' in popup);
      if ('class' in popup) {
        popup_options.className = popup_options.className +' '+ popup.class
      }

      this.show_popup(latlng, text, popup_options, template, action);
      this.popup_idx += 1;
    } else {
      // Story is finished
      heatmap.mymap.closePopup()
    }
  }

  show_popup(latlng, text, popup_options, template=null, action=null){
    let content = null;
    if (template==null){
      content = text;
    }else{
      content = template;
      content = content.replace('$text$', text);
      content = content.replace('$popup_idx$', this.popup_idx+1);
    }
    
    L.popup(popup_options)
      .setLatLng(latlng)
      .setContent(content)
      .openOn(heatmap.mymap);

    eval(action);
  }

  close_start_button(){
    // $('#start-story').css('display', 'none');
    $('#start-story').animate({ opacity: '0' }, 800, () => {
        $('#start-story').css('display', 'none');
    });
  }

}

