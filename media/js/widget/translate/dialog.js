// Universal Subtitles, universalsubtitles.org
// 
// Copyright (C) 2010 Participatory Culture Foundation
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see 
// http://www.gnu.org/licenses/agpl-3.0.html.

goog.provide('mirosubs.translate.Dialog');

/**
 * @constructor
 * 
 */
mirosubs.translate.Dialog = function(opener, 
                                     serverModel,
                                     videoSource, 
                                     subtitleState, 
                                     standardSubState) {
    mirosubs.Dialog.call(this, videoSource);
    mirosubs.SubTracker.getInstance().start(true);
    this.opener_ = opener;
    this.subtitleState_ = subtitleState;
    this.standardSubState_ = standardSubState;

    this.unitOfWork_ = new mirosubs.UnitOfWork();
    this.serverModel_ = serverModel;
    this.serverModel_.init(this.unitOfWork_);
    this.saved_ = false;
};
goog.inherits(mirosubs.translate.Dialog, mirosubs.Dialog);
mirosubs.translate.Dialog.prototype.createDom = function() {
    mirosubs.translate.Dialog.superClass_.createDom.call(this);
    this.translationPanel_ = new mirosubs.translate.TranslationPanel(
        this.subtitleState_, this.standardSubState_,
        this.unitOfWork_);
    this.getCaptioningAreaInternal().addChild(
        this.translationPanel_, true);
    var rightPanel = this.createRightPanel_();
    this.setRightPanelInternal(rightPanel);
    this.getHandler().listen(
        rightPanel, mirosubs.RightPanel.EventType.DONE,
        this.handleDoneKeyPress_);
    goog.dom.classes.add(this.getContentElement(),
                         'mirosubs-modal-widget-translate');
};
mirosubs.translate.Dialog.prototype.createRightPanel_ = function() {
    var title = this.subtitleState_.VERSION > 0 ? 
        "Editing Translation" : "Adding a New Translation";
    var helpContents = new mirosubs.RightPanel.HelpContents(
        title,
        [["Thanks for volunteering to translate! As soon as you submit ",
          "your translation, it will be available to everyone watching the ",
          "video in our widget."].join(''),
         ["Please translate each line, one by one, in the white  ", 
          "space below each line."].join(''),
         ["If you need to rearrange the order of words or split a phrase ",
          "differently, that's okay."].join(''),
         ["As you're translating, you can use the \"TAB\" key to advance to ",
          "the next line, and \"Shift-TAB\" to go back."].join('')
        ]);
    var extraHelp = [
        ["Google Translate", "http://translate.google.com/"],
        ["List of dictionaries", "http://yourdictionary.com/languages.html"],
        ["Firefox spellcheck dictionaries", 
         "https://addons.mozilla.org/en-US/firefox/browse/type:3"]
    ];
    return new mirosubs.translate.TranslationRightPanel(
        this,
        this.serverModel_, helpContents, extraHelp, [], false, "Done?", 
        "Submit final translation", "Resources for Translators");
};
mirosubs.translate.Dialog.prototype.handleDoneKeyPress_ = function(event) {
    this.saveWork(true);
    event.preventDefault();
};
mirosubs.translate.Dialog.prototype.isWorkSaved = function() {
    return !this.unitOfWork_.everContainedWork() || this.saved_;
};
mirosubs.translate.Dialog.prototype.saveWorkInternal = function(closeAfterSave) {
    var that = this;
    this.getRightPanelInternal().showLoading(true);
    this.serverModel_.finish(
        this.translationPanel_.makeJsonSubs(),
        function(dropDownContents) {
            that.getRightPanelInternal().showLoading(false);
            that.setDropDownContentsInternal(dropDownContents);
            that.saved_ = true;
            that.setVisible(false);
        });
};
mirosubs.translate.Dialog.prototype.disposeInternal = function() {
    mirosubs.translate.Dialog.superClass_.disposeInternal.call(this);
    this.unitOfWork_.dispose();
    this.serverModel_.dispose();
};
/**
 * Tries translate subtitles with GoogleTranslator
 */
mirosubs.translate.Dialog.prototype.translateViaGoogle = function(){
    //I don't know how better call this. I think it should be incapsulated in translationList_,
    //but have chain of function calls can confuse.
    this.translationPanel_.getTranslationList().translateViaGoogle(
        this.standardSubState_.LANGUAGE, this.subtitleState_.LANGUAGE);
};

mirosubs.translate.Dialog.prototype.getStandartLanguage = function(){
    return this.standardSubState_.LANGUAGE;
};

mirosubs.translate.Dialog.prototype.getSubtitleLanguage = function(){
    return this.subtitleState_.LANGUAGE;
};

/**
 * @param {function()} saveCompleted
 */
mirosubs.translate.Dialog.prototype.forkAndClose = function(saveCompleted) {
    this.serverModel_.forceSave(
        goog.bind(this.offerForking_, this, saveCompleted),
        saveCompleted);
};
mirosubs.translate.Dialog.prototype.offerForking_ = function(saveCompleted) {
    saveCompleted();
    var dialog = new mirosubs.translate.ForkDialog(
        this.serverModel_.getDraftPK(),
        this.subtitleState_.LANGUAGE,
        goog.bind(this.forkImpl_, this));
    dialog.setVisible(true);
};
mirosubs.translate.Dialog.prototype.forkImpl_ = function(subtitleState) {
    var oldReturnURL = mirosubs.returnURL;
    mirosubs.returnURL = null;
    this.saved_ = true;
    this.setVisible(false);
    mirosubs.returnURL = oldReturnURL;
    var that = this;
    this.opener_.openForkedTranslationDialog(
        this.serverModel_.getDraftPK(),
        subtitleState);
};
