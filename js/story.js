class Story{

  constructor(){
    this.has_started = false;

    this.popups = [
      {
        text:"Smood is company that allows you to order meals at restaurants near you and get them delivered to your home. <br> Press any key to continue...",
        latlng: L.latLng(46.5454, 6.63),
        action: "null",
        class: "popup-notip"
      },{
        text:"This visualisation explores the itineraries taken by deliveries made in the Lausanne area.",
        latlng: L.latLng(46.5454, 6.61),
        action: "null",
        class: "popup-notip"
      },{
        text:"Each circle represents a restaurant.",
        latlng: L.latLng(46.52672, 6.638082),
        action: "null"
      },{
        text:"The number of deliveries along any road is represented by a color map.",
        latlng: L.latLng(46.5454, 6.61),
        action: "null",
        class: "popup-notip"
      },{
        text:"By clicking on a road, one can select all deliveries that go through it. Try it by yourself!",
        latlng: L.latLng(46.5454, 6.63),
        action: "null",
        class: "popup-notip"
      },{
        text:"We can for example see that the most popular delivery is the one from Rue du Flon, in the center of Lausanne, to La Vulliette, near the École Hôtelière.",
        latlng: L.latLng(46.55, 6.6493),
        action: "heatmap.set_road_ids(["+most_popular_delivery_ids.toString()+"]);heatmap.update_map();"
      },{
        text:"Similarly, we can click on any restaurant to select all deliveries from there.",
        latlng: L.latLng(46.55, 6.63),
        action: "heatmap.set_road_ids([...Array(2000).keys()]);heatmap.update_map();",
        class: "popup-notip"
      },{
        text:"We can for example see that the most popular restaurant has food delivered all over Lausanne.",
        latlng: L.latLng(46.5454, 6.61),
        action: "heatmap.set_selected_restaurants([0]);heatmap.set_road_ids(heatmap.r_data[0].road_ids);heatmap.update_map();",
        class: "popup-notip"
      },{
        text:"Using the timeline below, one can either select a specific time range, or show an animation of the deliveries along the day.",
        latlng: L.latLng(46.49342900178936, 6.636600494384766),
        action: "heatmap.set_selected_restaurants([]);heatmap.set_road_ids([...Array(2000).keys()]);heatmap.update_map();"
      },{
        text:"For any selection, further insights are shown in the sidebar on the left.",
        latlng: L.latLng(46.54268697331455, 6.589221954345704),
        action: "null",
        class: "popup-tip-left"
      },{
        text:"That’s it, now you can explore the data by yourself!",
        latlng: L.latLng(46.5454, 6.61),
        action: "null",
        class: "popup-notip"
      }
    ];
    this.nb_popups = this.popups.length;
    this.template = `
      <span class='story-state'>$popup_idx$/${this.nb_popups}</span>
      <button type="button" onclick="story.next_popup()" id="story-next-btn" class="btn btn-primary">Next<i class="fas fa-arrow-right icon-right"></i></button>
      <button type="button" onclick="story.stop()" id="story-skip-btn" class="btn btn-link">Skip</button>
      <p>$text$</p>
      `
    this.template_last = `
      <span class='story-state'>$popup_idx$/${this.nb_popups}</span>
      <button type="button" onclick="story.stop()" id="story-next-btn" class="btn btn-primary">Ok, got it!</button>
      <p>$text$</p>
      `

    this.popup_options = {
      'className': 'custom-popup',
      'keepInView': true,
      'maxWidth': 300,
      'minWidth': 250,
      'closeButton': false,
      'autoPanPaddingTopLeft': L.point(310,30),
      'autoPanPaddingBottomRight': L.point(260,60),
      'closeOnClick': false
    };

    $('#about-start-story').click(() => {
      $('#about-modal').modal('hide');
      // $('#start-story').css('display', 'none');
      window.setTimeout(() => {this.start_story()}, 300);
    });

    document.addEventListener('keypress', on_key_press); 

    this.start_story()
  }

  start_story(){
    this.has_started = true;
    this.popup_idx = 0;
    this.next_popup();
  }

  stop(){
    heatmap.mymap.closePopup()
    this.has_started = false;
  }

  next_popup(){
    if (this.has_started){
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
        if ('class' in popup) {
          popup_options.className = popup_options.className +' '+ popup.class
        }

        this.show_popup(latlng, text, popup_options, template, action);
        this.popup_idx += 1;
      } else {
        // Story is finished
        this.stop()
      }
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

}

function on_key_press(event){
  if(event.key === "Escape") {
    story.stop();
  } else {    
    story.next_popup();
  }
}

let most_popular_delivery_ids = [   5,    7,   27,   28,   33,   36,   45,   47,   51,   55,   69,
         70,   71,   82,   83,   90,   96,  118,  120,  124,  134,  137,
        146,  151,  152,  154,  161,  162,  164,  170,  171,  198,  210,
        211,  220,  229,  241,  250,  255,  266,  273,  275,  283,  287,
        290,  295,  298,  301,  307,  309,  325,  326,  329,  344,  348,
        353,  360,  363,  366,  367,  375,  384,  385,  387,  393,  394,
        395,  400,  415,  437,  442,  464,  465,  466,  468,  473,  477,
        478,  495,  536,  541,  544,  545,  546,  551,  554,  572,  584,
        585,  590,  599,  603,  620,  625,  631,  642,  645,  651,  668,
        669,  682,  690,  697,  702,  704,  715,  716,  719,  734,  745,
        752,  759,  775,  797,  802,  807,  824,  825,  827,  828,  829,
        830,  834,  839,  843,  847,  851,  865,  871,  873,  876,  881,
        905,  906,  924,  925,  926,  932,  935,  937,  942,  948,  949,
        956,  971,  972,  973,  975,  981,  993,  995, 1001, 1015, 1016,
       1022, 1023, 1032, 1033, 1037, 1044, 1062, 1065, 1074, 1081, 1090,
       1099, 1101, 1108, 1116, 1120, 1122, 1123, 1137, 1140, 1141, 1145,
       1148, 1151, 1165, 1167, 1176, 1182, 1189, 1204, 1213, 1219, 1237,
       1240, 1244, 1251, 1252, 1269, 1288, 1289, 1295, 1310, 1316, 1319,
       1321, 1323, 1330, 1331, 1336, 1337, 1339, 1340, 1341, 1350, 1359,
       1366, 1368, 1380, 1399, 1400, 1407, 1423, 1436, 1437, 1443, 1453,
       1466, 1473, 1478, 1480, 1484, 1486, 1489, 1491, 1505, 1507, 1510,
       1515, 1520, 1535, 1559, 1569, 1579, 1581, 1583, 1584, 1587, 1598,
       1601, 1605, 1606, 1618, 1619, 1646, 1650, 1678, 1679, 1682, 1695,
       1704, 1706, 1717, 1722, 1729, 1736, 1743, 1744, 1756, 1758, 1759,
       1760, 1775, 1778, 1786, 1793, 1799, 1810, 1819, 1822, 1826, 1829,
       1832, 1833, 1840, 1842, 1850, 1851, 1864, 1865, 1875, 1908, 1914,
       1919, 1922, 1924, 1927, 1933, 1938, 1946, 1948, 1961, 1967, 1970,
       1972, 1986, 1991, 1993, 1996, 1998];

