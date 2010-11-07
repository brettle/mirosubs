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

goog.provide('mirosubs.widgetizer.Youtube');

/**
 * @constructor
 *
 */
mirosubs.widgetizer.Youtube = function() {
    mirosubs.widgetizer.VideoPlayerMaker.call(this);
    /**
     * @const
     */
    this.ON_YT_SITE = 
        window.location.hostname.match(/youtube\.com$/) != null;
};
goog.inherits(mirosubs.widgetizer.Youtube,
              mirosubs.widgetizer.VideoPlayerMaker);

mirosubs.widgetizer.Youtube.prototype.videosExist = function() {
    return this.unwidgetizedElements_().length > 0;
};

mirosubs.widgetizer.Youtube.logger_ =
    goog.debug.Logger.getLogger('mirosubs.widgetizer.Youtube');

mirosubs.widgetizer.Youtube.prototype.makeVideoPlayers = function() {
    var elements = this.unwidgetizedElements_();
    var videoPlayers = [];
    for (var i = 0; i < elements.length; i++) {
        var decoratable = this.isDecoratable_(elements[i]);
        var videoSource = this.makeVideoSource_(
            elements[i], !decoratable);
        var videoPlayer = videoSource.createPlayer();
        videoPlayers.push(videoPlayer);
        if (decoratable)
            videoPlayer.decorate(elements[i]);
        else
            this.replaceVideoElement_(videoPlayer, elements[i]);
    }
    return videoPlayers;
};

mirosubs.widgetizer.Youtube.prototype.isDecoratable_ = function(element) {
    if (this.ON_YT_SITE)
        return true;
    // assuming that element is an embed.
    return element.getAttribute('allowscriptaccess') == 'always' &&
        element.src.match(/enablejsapi=1/i);
};

mirosubs.widgetizer.Youtube.prototype.makeVideoSource_ = 
    function(element, includeConfig) 
{
    // assuming that element is an embed.
    var url = element['src'];
    var config = null;
    if (includeConfig) {
        config = {};
        var uri = new goog.Uri(url, true);
        var params = uri.getQueryData().getKeys();
        for (var i = 0; i < params.length; i++)
            config[params[i]] = uri.getParameterValue(params[i]);
        config['width'] = element['width'];
        config['height'] = element['height'];
    }
    var youtubePageURL = this.ON_YT_SITE ? window.location.href : url;
    return mirosubs.video.YoutubeVideoSource.forURL(
        youtubePageURL, config);
};

mirosubs.widgetizer.Youtube.prototype.replaceVideoElement_ = 
    function(player, element) 
{
    // this might get extracted to superclass as soon as we include 
    // players other than youtube.
    var nextNode = goog.dom.getNextNode(element);
    var parent = element.parentNode;
    goog.dom.removeNode(element);
    if (nextNode)
        player.renderBefore(nextNode);
    else
        player.render(parent);
};

mirosubs.widgetizer.Youtube.prototype.isYoutubeEmbed_ = function(element) {
    // assuming embed element
    var url = element['src'];
    return mirosubs.video.YoutubeVideoSource.isYoutube(url);
};

mirosubs.widgetizer.Youtube.prototype.unwidgetizedElements_ = function() {
    if (this.ON_YT_SITE) {
        var moviePlayer = goog.dom.getElement('movie_player');
        var elements = moviePlayer ? [moviePlayer] : [];
        return this.filterUnwidgetized(elements);
    }
    else {
        var unwidgetizedElements = [];
        // most likely this will not catch all youtube players on the page
        var embeds = document.getElementsByTagName('embed');
        for (var i = 0; i < embeds.length; i++) {
            if (this.isYoutubeEmbed_(embeds[i]) && this.isUnwidgetized(embeds[i]))
                unwidgetizedElements.push(embeds[i]);
        }
        return unwidgetizedElements;
    }
};