//-------------------------------------------------------------------
// announcement resizer
//-------------------------------------------------------------------
// TODO:
//-------------------------------------------------------------------

const app = function () {
  const appversion = '1.01';
  const appname = 'Announcement sizer';
  
	const page = {};
	const settings = {};
  
	//---------------------------------------
	// get things going
	//----------------------------------------
	function init () {
		page.body = document.getElementsByTagName('body')[0];
     
    _renderPage();
	}
	
	//-----------------------------------------------------------------------------
	// page rendering
	//-----------------------------------------------------------------------------  
  function _renderPage(config) {
    page.container = CreateElement.createDiv('mainContainer', null);
    page.body.appendChild(page.container);
    
    var title = _renderTitle();
    page.container.appendChild(title);
    
    page.notice = new StandardNotice(page.body, title);
    page.notice.setNotice('');

    var container = CreateElement.createDiv('contentsContainer', null);
    page.container.appendChild(container);
    
    container.appendChild(_renderControls());
    container.appendChild(_renderPreviewSection());
  }
  
  function _renderTitle() {
    var title = CreateElement.createDiv(null, 'standard-title', appname);
    
    var controlcontainer = CreateElement.createSpan('title-controls', null);
    title.appendChild(controlcontainer);
    controlcontainer.title = 'copy embed code to clipboard';
    controlcontainer.addEventListener('click', _handleEmbedClick, false);
    controlcontainer.appendChild(CreateElement.createIcon('iconEmbedLeft', 'fas fa-angle-left', 'copy embed code to clipboard'));
    controlcontainer.appendChild(CreateElement.createIcon('iconEmbedRight', 'fas fa-angle-right', 'copy embed code to clipboard'));
    
    title.appendChild(CreateElement.createDiv('appVersion', null, 'v' + appversion));
    
    return title;
  }
  
  function _renderControls() {
    var container = CreateElement.createDiv(null, 'standard-section');
    
    var contents = CreateElement.createDiv(null, 'standard-section-contents');
    container.appendChild(contents);
    
    contents.appendChild(_createSlidesLinkSpecify());
    contents.appendChild(_createPaddingSelect());
    contents.appendChild(_createNavigationSelect());
    
    return container;
  }
      
  function _createSlidesLinkSpecify() {
    var container = CreateElement.createDiv(null, 'control-container');
    
    container.appendChild(CreateElement.createDiv(null, 'control-label', 'slides link'));
    var textinput = CreateElement.createTextInput('inputSlidesLink', null);
    container.appendChild(textinput);
    textinput.size = 80;
    textinput.addEventListener('click', _handleGeneric, false);
    textinput.title = 'link to the published Google Sheet document';
    textinput.addEventListener('input', _handleSlidesLinkChange, false);
    
    container.appendChild(CreateElement.createButton(null, null, 'preview', null, _handlePreviewClick));
    
    return container;
  }
  
  function _createPaddingSelect() {
    var container = CreateElement.createDiv(null, 'control-container');
    
    container.appendChild(CreateElement.createDiv(null, 'control-label', 'padding %'));
    var spininput = CreateElement.createSpinner('inputPadding', null, 60, 30, 200, 0.1)
    container.appendChild(spininput);
    spininput.title = 'adjust padding to size slides';
    spininput.addEventListener('click', _handlePaddingSelectChange, false);
    spininput.addEventListener('input', _handlePaddingSelectChange, false);
    
    return container;
  }
  
  function _createNavigationSelect() {
    var container = CreateElement.createDiv(null, 'control-container');
    
    container.appendChild(CreateElement.createDiv(null, 'control-label', 'navigation'));
    var cbNavigation = CreateElement.createCheckbox('cbNavigation', null, null, true, null, true, _handleNavigationSelect);
    cbNavigation.title = 'include navigation controls with slides';
    container.appendChild(cbNavigation);
    
    return container;
  }
  
  function _renderPreviewSection() {
    var container = CreateElement.createDiv('previewContainer', null, 'preview');
    
    return container;
  }

  //---------------------------------------
	// preview 
	//----------------------------------------
  function _showPreview() {
    var success = false;
    
    var slideSource = _getSlideBaseLink(document.getElementById('inputSlidesLink').value);
    if (slideSource == null) {
      page.notice.setNotice('invalid slide link');
      return false;
    }
    
    var paddingPercent = document.getElementById('inputPadding').value;
    var container = document.getElementById('previewContainer');
    var includeNavigation = document.getElementById('cbNavigation').checked;
    if (!includeNavigation) slideSource += 'rm=minimal';

    _clearPreview();
    
    
    page.notice.setNotice('loading preview...', true);
    try {
      var innerContainer = CreateElement.createDiv('innerPreviewContainer', null);
      var previewDiv = CreateElement.createDiv('previewDiv', null);
      innerContainer.appendChild(previewDiv);
      previewDiv.style.paddingBottom = paddingPercent + '%';
      
      var previewIframe = CreateElement.createIframe('previewIframe', null, slideSource, '100%', '100%', true);
      previewDiv.appendChild(previewIframe);
      
      container.appendChild(innerContainer);
      container.style.display = 'block';
      page.notice.setNotice('');
      success = true;

    } catch (err) {
      page.notice.setNotice('failed to load preview');
      console.log(err);
    }
    
    _setCopyControls();
    
    return success;
  }
  
  function _clearPreview() {
    var container = document.getElementById('previewContainer');

    container.style.display = 'none';
    while (container.firstChild) container.removeChild(container.firstChild);

    _setCopyControls();
  }
  
  function _getSlideBaseLink(fullLink) {
    var baseLink = null;
    
    var endOfBase = fullLink.indexOf('/pub?');
    if (endOfBase > 0) {
      baseLink = fullLink.slice(0, endOfBase) + '/embed?';
    }
    
    if (baseLink == null) {
      var endOfBase = fullLink.indexOf('/embed?');
      if (endOfBase > 0) {
        baseLink = fullLink.slice(0, endOfBase) + '/embed?';
      }
    }
    
    return baseLink;
  }
  
  function _previewShowing() {
    return document.getElementById('previewContainer').firstChild != null;
  }
  
  function _setCopyControls() {
    var display = 'none';
    if (_previewShowing()) display = 'inline-block';
    
    document.getElementById('iconEmbedLeft').style.display = display;
    document.getElementById('iconEmbedRight').style.display = display;
  }
  
  //---------------------------------------
	// embed code
	//----------------------------------------
  function _makeAndCopyEmbed() {
    var slideSource = document.getElementById('previewIframe').src;
    var padding = document.getElementById('previewDiv').style.paddingBottom;
    
    var embedCode = '';
    embedCode += '<div style="padding-bottom: ' + padding + '; position: relative; display: block; width: 100%;">';
    embedCode += '  <iframe ';
    embedCode += '    width="100%" ';
    embedCode += '    height="100%" ';
    embedCode += '    style="position: absolute; top: 0; left: 0;" ';
    embedCode += '    src="' + slideSource + '" ';
    embedCode += '    allowfullscreen="true" ';
    embedCode += '  >';
    embedCode += '  </iframe>';
    embedCode += '</div>';
    
    _copyToClipboard(embedCode);
    page.notice.setNotice('copied embed code');
  }
  
  //---------------------------------------
	// clipboard
	//----------------------------------------
  function _copyToClipboard(txt) {
    if (!page._clipboard) page._clipboard = new ClipboardCopy(page.body, 'plain');

    page._clipboard.copyToClipboard(txt);
	}	
  
  //---------------------------------------
	// handlers
	//----------------------------------------
  function _handleGeneric() {
    page.notice.setNotice('');
  }
  
  function _handleSlidesLinkChange(e) {
    _clearPreview();
  }
  
  function _handlePaddingSelectChange() {
    if (_previewShowing()) {
      var padding = document.getElementById('inputPadding').value;
      document.getElementById('previewDiv').style.paddingBottom = padding + '%';
    }
  }
  
  function _handleEmbedClick() {
    _makeAndCopyEmbed();
  }
  
  function _handleNavigationSelect() {
    if (_previewShowing()) _showPreview();
  }
  
  function _handlePreviewClick() {
    _showPreview();
  }


  //---------------------------------------
	// return from wrapper function
	//----------------------------------------
	return {
		init: init
 	};
}();
