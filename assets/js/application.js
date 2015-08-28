jQuery(function($) {

	"use strict";

	//Element cache system
	var Elem = {

		//General
		$html : $('html'),
		$body : $('body'),
		$navbar : $('#navbar-header'),
		$navbarMain : $('#main-navbar'),


		//Work
		$navFilter : $('.works__filter'),
		$works : $('.works__itemList'),
		$worksMoreBtn : $('.js--loadWork'),
		$worksErrorLoad : $('.js--errorLoadWork'),
		$worksNoItemBtn : $('.js--noWorkFilter'),

		//Work zoom
		$workZoom : $('.zoomWork'),
		$workZoomContent : $('.zoomWork__content'),
		$workZoomPanel : $('.zoomWork__panel'),
		$workZoomNav : $('.js--zoom-nav'),

		//Contact
		$form : $(".js--form")

	};

	//Dynamique text
	var Txt = {
		form_erreur_mail : 'Vous devez renseigner une adresse e-mail valide',
		form_erreur_require : 'Vous devez renseigner tous les champs non optionnels',
		mailSend : 'Votre demande a bien été envoyée !',
		mailFail : 'Erreur lors de la tentative d\'envoi. Veuillez envoyer un e-mail à contact@pexel.me',
		messageLimit : 'Impossible d\'envoyer plus de 1500 caractères. Veuillez envoyer un e-mail à contact@pexel.me"',
		worksMoreDefault : Elem.$worksMoreBtn.text(),
		worksMoreHide : Elem.$worksMoreBtn.attr('data-text-hide')
	};

	//Configuration
	var Config = {

		//Base
		js : false,                         //JS activate
		touch : false,                      //Touch device
		filterType : 'all',                 //Active type filter for work
		allWorks : false,                   //All works display
		urlWorksData : 'datas/projects.xml',//url for works data
		zoomWorkId : null,                  //Actual zoom work display
		workLightDisplayNb : 6,             //Nb of work displayed on work light mode
		timeoutScroll : null,               //Scrolling (for execute checking)

		//Init action
		init : function(){
			Detect.js();                //Detect JS (Oups, it's not really necessary but i like it)
			Detect.touch();             //Detect touch device
			Work.load();                    //Load built work section
			Event.init();                   //Init events
		}
	};

	//Event action
	var Event = {

		//Init events
		init : function(){

			//Scroll
			$(window).scroll( Scroll.stop );                        //End scrolling action

			//Link
			$('a[href*=#]').click( Scroll.target );                 //Interne link
			$('a:not([href*=#])').click( Detect.extLink );          //Externe link

			//Work filter action
			$('.js--workFilter').find('li').click( Work.filter );   //Change work filter
			$('.js--loadWork').click( Work.more );                  //Display all works
			$('.js--noWorkFilter').click( Work.more );              //Display all works if empty filter response

			//Contatct Form
			Elem.$form.submit( Mail.submit);                        //Submit a mail
			Elem.$form.find('input,textarea').focus( Mail.focus );  //Focus on field (init error)

			//Zoom:open
			Elem.$works.on('click', '.js--zoom-project', Work.zoom );//Zoom on work

			//Zoom:nav
			$(".js--zoom-close").click( Work.zoomClose );           //Close zoom
			$(".js--close-area").click( Work.zoomClose );           //Close zoom
			Elem.$workZoomNav.click( Work.zoomNav );               //Nav into works
		}
	};

	//Scroll function
	var Scroll = {

		//Go section from internal link
		target : function(event){

			event.preventDefault();

			//Get URL
			var allUrl = this.href;
			var urlHack = allUrl.split("#");
			var ancreUrl = urlHack[1];

			//Scroll to section
			Scroll.to(ancreUrl);

		},

		//Scroll to section with ID like var
		to : function(target){

			//Header height - for security marge
			var safeMargin = Elem.$navbar.height();

			//Get top value
			var target_offset = $("#"+target).offset();
			var target_top = target_offset.top;

			//If home section
			if(target === 'home') target_top = 0;

			//Animate scrolling to section
			$('html, body').animate({scrollTop:target_top - safeMargin}, 1000);
		},

		//When the scrolling stops
		stop : function(){

			//Clear timeout for re-init
			clearTimeout(Config.timeoutScroll);

			//Active action if scrolling stops
			Config.timeoutScroll = setTimeout(function(){

				//Active nav menu
				Scroll.nav();

				//Active class
				Scroll.top();

			},100);

		},

		//Active nav menu
		nav : function(){

			//For each section present in nav
			$('[data-scroll-nav=yes]').each(function() {

				var anchor = $(this).attr('id'),                                                //Get section ID
					windscroll = $(window).scrollTop(),                                         //Top position of scroll
					positionWithSecure = $(this).position().top - Elem.$navbar.height() - 100;  //Top position of section

				//If top position of section < top scroll
				if (positionWithSecure <= windscroll) {

					//Remove is--active && add is--hidden for this section
					Elem.$navbarMain.find('li').removeClass('is--active');
					Elem.$navbarMain.find('a[href=#'+anchor+']').parents('li').addClass('is--active');
				}
			});
		},

		//Toggle top class
		top : function() {

			var windscroll = $(window).scrollTop();

			if (windscroll > 100)
				Elem.$body.addClass('reduce-nav');
			else
				Elem.$body.removeClass('reduce-nav');
		}

	};

	//Work
	var Work = {

		datas : {}, //Work datas - before load

		//Load the work datas
		load : function(){

			//Ajax access
			$.ajax({
				type: 'GET',
				url: Config.urlWorksData,
				dataType: 'xml',

				//Success action
				success: function(works){

					var tempDatas = [],                                     //Temporary data for built final array
						xmlData = $($(works).find('item').get().reverse()); //Reverse datas from XML

					//Creat array with each data return
					xmlData.each(function(i){

						var item = $(this);

						//Built temp data
						var temp = {};
						temp.id = i+1;
						temp.type = item.attr('type');
						temp.title = item.find('title').text();
						temp.urlAnchor = item.attr('url-anchor');
						temp.urlProjectName = item.find('url-project').text();
						temp.urlProject = item.find('url-project').attr('link');
						temp.desc = item.find('desc').text();
						temp.date = item.find('date').text();
						temp.agency = item.find('agency').text();
						temp.company = item.find('company').text();
						temp.hidden = ( i+1 > Config.workLightDisplayNb); //Hide the work if upper of 6

						//If medias exist
						if(item.find('images media').length > 0){

							temp.imgs = [];

							//For each media found
							item.find('images media').each(function(){

								var urlImg = $(this).text(),
									altImg = $(this).attr('alt');

								//Add imgs data
								temp.imgs.push({
									url : urlImg,
									alt : altImg
								});

							});
						}

						//If tags exist
						if(item.find('tags name').length > 0){

							temp.tags = [];

							//For each tag found
							item.find('tags name').each(function(){
								temp.tags.push($(this).text());
							});
						}

						//Add temp data in final array
						tempDatas.push(temp);

					});

					//Save datas on global var
					Work.datas = tempDatas;

					//Built work list
					Work.built();

					//Check if work presents in URL
					Work.checkUrl();

				},

				//Error action
				error:function(error){

					//Hide works content & show reload button
					Elem.$works.html('');
					Elem.$worksErrorLoad.fadeIn();
				}
			});
		},

		//Built action
		built : function(){

			//Temp datas - for use data with mustache
			var tempDatas = {};
			tempDatas.works = Work.datas;

			//Init var
			var template = $('#template-work-item').html(),     //Get template
				rendered = Mustache.render(template,tempDatas); //Built HTML result from template & datas

			//Add HTML result in works content
			Elem.$works.html(rendered);

			//If hidden works exist
			if(Elem.$works.find('.is--hidden').length > 0)
				Elem.$worksMoreBtn.fadeIn();

		},

		//Built zoom
		builtZoom : function(index,noNav){

			//Get data
			var tempData = Work.datas[index];

			//Check noNav argument
			noNav = noNav || false;

			//If temp data exists
			if(tempData != undefined){

				var idWork = Work.datas[index].id,                          //ID number of work
					$work = Elem.$works.find('[data-work-id='+idWork+']'),  //$bloc in works list
					template = $('#template-work-zoom').html(),             //Get template
					rendered = Mustache.render(template, tempData);         //Built HTML result from template & datas

				//Add HTML result in work zoom content
				Elem.$workZoomContent.html(rendered);

				//If hide the nav, else verify the necessary of next/prev button in nav
				if(noNav)
					Elem.$workZoomNav.hide();
				else
					Work.zoomDisplayPrevNext($work);

				//Show zoom work content if not visible
				if(!Elem.$workZoom.is(":visible")){

					Elem.$workZoom.fadeIn();            //Show work zoom content
					Elem.$body.addClass('zoom-open');   //Stop scroll in main content
					Elem.$html.addClass('zoom-open');   //Stop scroll in main content
				}

				//Update URL
				var urlHash = tempData.urlAnchor;
				window.location.hash = '!/'+urlHash;

				//Update work ID zoomed
				Config.zoomWorkId = Work.datas[index].id;
			}
		},

		//Get array index from datas with key/value checking
		getIndexWorkFromData : function(key,value){

			var index = -1;

			for(var pos in Work.datas){
				if( Work.datas[pos][key] == value){
					index = pos;
					break;
				}
			}

			return index;

		},

		//Check if work URL exists
		checkUrl : function(){

			//Get hash URL
			var urlLoaded = location.hash;

			//If exists
			if(urlLoaded[1] == '!'){


				var hash = location.hash.substr(1).replace('!/',''),    //Clean the hash
					index = Work.getIndexWorkFromData('urlAnchor',hash);//Get array index of work if exists

				//If work exists, built and show the work
				if(index > -1) Work.builtZoom(index,true);
			}

		},

		//Works filter
		filter : function(type,forced){

			//Check if filter exists in var, else, get type in bloc attribut
			type = ($.type(type) === "string") ? type : $(this).attr('data-work-filter');
			forced = forced || false;

			//Cache work item block
			var $workItem = Elem.$works.find('.works__item');

			//Update active filter in nav filter
			Elem.$navFilter.find('.active').removeClass('active');
			Elem.$navFilter.find('[data-work-filter='+type+']').addClass('active');

			//If new filter
			if(Config.filterType !== type || forced) {

				//If 'all' request
				if (type == 'all') {

					//Show all works
					Elem.$works.find('.works__item.is--hidden').removeClass('is--hidden');
					
					//Set all works like displays
					Work.allDisplay(true);
				}

				else {

					//For each work item
					$workItem.each(function () {

						//Get type of work item
						var typeWork = $(this).attr('data-work-type');

						//If work is not the required type, it's hidden, else it's shown
						if (typeWork != type)
							$(this).addClass('is--hidden');

						else
							$(this).removeClass('is--hidden');

					});

					//Set works list like not 'all' display mode
					Work.allDisplay(false);
				}

				//If hidden item exists, show the noItem button
				(Elem.$works.find('.works__item:not(.is--hidden)').length == 0) ?
					Elem.$worksNoItemBtn.fadeIn() :
					Elem.$worksNoItemBtn.hide();

			}

			//update the active work filter
			Config.filterType = type;
		},

		//Display more work item
		more : function(){

			//If all works are not displayed
			if(!Config.allWorks){

				//Update the work filter
				Work.filter('all',true);

			}
			else {

				//Hide work item after their array index > N
				Elem.$works.find('.works__item').each(function(i) {
					if(i+1 > Config.workLightDisplayNb)	$(this).addClass('is--hidden');
				});

				//Set works list like not 'all' display mode
				Work.allDisplay(false);

			}

			//Scroll to top of works list section
			Scroll.to('works');
		},
		
		//Set works list like all displayed
		allDisplay : function(state){

			if(state){

				//Update More button text
				Elem.$worksMoreBtn.text(Txt.worksMoreHide);

				//Update all works state
				Config.allWorks = true;

			}
			else{

				//Update More button text
				Elem.$worksMoreBtn.text(Txt.worksMoreDefault);

				//Update all works state
				Config.allWorks = false;
			}
		},

		//Zoom on a work item
		zoom : function(){

			//Get var
			var idProject = parseInt($(this).attr('data-work-id')), //ID work
				index = Work.getIndexWorkFromData('id',idProject);  //Index from ID work

			//Built zoom section
			Work.builtZoom(index);

		},

		//Show/hide nav button in zoom section
		zoomDisplayPrevNext : function($bloc){

			//Nextnot hidden work item not exists
			if($bloc.nextAll('article:not(.is--hidden):first').length == 0) $('.js--zoom-next').hide();
			else $('.js--zoom-next').show();

			//Prev not hidden work item not exists
			if($bloc.prevAll('article:not(.is--hidden):first').length == 0) $('.js--zoom-prev').hide();
			else $('.js--zoom-prev').show();

		},

		//Close the zoom work section
		zoomClose : function(){
			
			Elem.$workZoom.fadeOut('fast',function(){

				Elem.$body.removeClass('zoom-open');//Unlock main section scrolling
				Elem.$html.removeClass('zoom-open');//Unlock main section scrolling
				window.location.hash = '/';         //Update the URL
			});
		},

		//Nav in zoom work section
		zoomNav : function(){
			
			var typeNav = $(this).attr('data-zoom-nav'),                            //Prev or next action
				$oldWork = Elem.$works.find('[data-work-id ='+Config.zoomWorkId+']');//Get actual work item $block in zoom
			
			//Get new work item $block
			var $newWork = (typeNav != 'next') ?
				$oldWork.prevAll('article:not(.is--hidden):first') :
				$oldWork.nextAll('article:not(.is--hidden):first');
			
			var idProject = $newWork.attr('data-work-id'),          //Get new work item ID
				index = Work.getIndexWorkFromData('id',idProject);  //Get array index from ID 

			//Hide zoom work item content
			Elem.$workZoomContent.fadeOut('normal',function(){

				//Built the new zoom work item content
				Work.builtZoom(index);

				//Show zoom work item content
				$(this).fadeIn();
			});
		}
	};

	//Mail 
	var Mail = {

		//Get form values
		$formCompany : Elem.$form.find('input[name=contact-company]'),
		$formSubject : Elem.$form.find('input[name=contact-subject]'),
		$formMail : Elem.$form.find('input[name=contact-mail]'),
		$formName : Elem.$form.find('input[name=contact-name]'),
		$formMessage : Elem.$form.find("textarea"),

		//Submit
		submit : function(){

			var valid = true;

			//For each required field
			Elem.$form.find('[data-require=true]').each(function(){

				//if empty
				if($(this).val() == ''){

					//If nothing error found before
					if(valid){

						//Alert user
						alert(Txt.form_erreur_require);

						//Update CSS
						$(this).addClass('is--required');

						//Declare like not valid
						valid = false;
					}
					else{
						$(this).addClass('is--required')
					}
				}
				else {
					$(this).removeClass('is--required')
				}
			});

			//If one or more required field are empty
			if(valid == false)
				return false;

			//If mail value is wrong
			if(!Mail.$formMail.val().match(/^[a-z0-9._-]+@[a-z0-9._-]{2,}\.[a-z]{2,4}$/))
			{
				//Alert user
				alert(Txt.form_erreur_mail);

				//Add error class and focus on field
				Mail.$formMail.addClass('is--required').focus();

				return false;

			} else Mail.$formMail.removeClass('is--required');


			//If valid, send the mail
			if(valid) Mail.send();

			return false;
		},

		//Focus on field - for update CSS
		focus : function(){
			
			if($(this).hasClass('is--required'))
				$(this).removeClass('is--required');

		},

		//Send the mail
		send : function(){

			//Set active send
			var active_send = false;

			//Get field values
			var message = Mail.$formMessage.val(),
				mail = Mail.$formMail.val(),
				subject = Mail.$formSubject.val(),
				name = Mail.$formName.val(),
				company = Mail.$formCompany.val();

			//If message is over
			if(message.length>1500)
				alert(Txt.messageLimit);

			else if(!active_send)
			{

				//Secure the content
				message = message.replace(/€/g,"euros");
				message = message.replace(/&/g,";;amp;;");
				message = message.replace(/\+/g,";;plus;;");

				subject = subject.replace(/€/g,"euros");
				subject = subject.replace(/&/g,";;amp;;");
				subject = subject.replace(/\+/g,";;plus;;");

				name = name.replace(/€/g,"euros");
				name = name.replace(/&/g,";;amp;;");
				name = name.replace(/\+/g,";;plus;;");

				company = company.replace(/€/g,"euros");
				company = company.replace(/&/g,";;amp;;");
				company = company.replace(/\+/g,";;plus;;");

				//Change send state
				active_send = true;

				//Set button like "ghost"
				Elem.$form.find('button').unbind("click");

				//Send mail
				var form = $.ajax({

					type: "POST",
					url: "core/ajax/mail.php",
					data:
					"&message="+message+
					"&mail="+mail+
					"&name="+name+
					"&company="+company+
					"&subject="+subject,
					
					//Success action
					success: function(msg){

						//Update send state
						active_send = false;

						//If mail sent
						if(msg == 'valide') {
							
							//Alert user
							alert(Txt.mailSend);

							//Clean the field
							Elem.$form.find('input,textarea').val('');
						}
						else{
							alert(Txt.mailFail);
						}


					}
				});
			}

			return false;
		}
	};

	//Detect function
	var Detect = {

		//Active JS
		js : function(){

			//Set config value
			Config.js = true;

			//Delete class value
			Elem.$body.removeClass('no-js');
		},

		//Detect touch mode
		touch : function(){

			//Touch device
			if(/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)){
				Config.touch = true;
				Elem.$body.addClass('is--touch');
			}

			else Elem.$body.addClass('is--notouch');
		},

		//External link
		extLink : function(){

			//Set var
			var url = $(this).attr('href'),
				pattern = /^((http|https|ftp):\/\/)/;

			//If true
			if(pattern.test(url)) {
				window.open(url, '_blank');
				return false;
			}
			else return true;
		}
	};

	//Init config
	Config.init();

	//Init wow script
	var wow = new WOW({
		offset : 50,
		mobile : false
	});
	wow.init();

});