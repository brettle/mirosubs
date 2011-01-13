# Universal Subtitles, universalsubtitles.org
# 
# Copyright (C) 2010 Participatory Culture Foundation
# 
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
# 
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see 
# http://www.gnu.org/licenses/agpl-3.0.html.

from videos.models import Video, SubtitleVersion
from piston.handler import BaseHandler, AnonymousBaseHandler
from piston.utils import rc
from api import validate
from django.contrib.sites.models import Site
from forms import GetVideoForm, AddSubtitlesForm

class VideoHandler(BaseHandler):
    """
    API handler for Video.
    """
    
    anonymous = 'AnonymousVideoHandler'
    allowed_methods = ('GET',)
    fields = ('title', 'description', 'video_id', 'thumbnail', 'created', 
              'allow_community_edits', 'allow_video_urls_edit', 'homepage')
    model = Video

    @classmethod
    def resource_uri(cls, video):
        return ('api:0.1:video_handler', [video.video_id])
    
    @classmethod
    def thumbnail(self, obj):
        return obj.get_thumbnail()
    
    @classmethod
    def homepage(self, obj):
        site = Site.objects.get_current()
        return 'http://%s%s' % (site.domain, obj.get_absolute_url())
    
    @validate(GetVideoForm, 'GET')    
    def read(self, request, video_id=None):
        """
        Get video by video_id(JVoMAa3kaWzq)
        <em>curl "http://127.0.0.1:8000/api/1.0/video/JVoMAa3kaWzq/"</em>
        
        Get video by url. It will be created if does not exist.
        Authentication is not required. If video does not exist and you are 
        authenticated - you will be saved as creator for this video.
        <em>curl "http://127.0.0.1:8000/api/1.0/video/?username=admin&password=admin" -d 'video_url=http://www.youtube.com/watch?v=oOOve811tMY' -G</em>
        
        Response format is JSON by default. You can set format with <b>"format"</b>
        parameter in URL, like <em>'http://127.0.0.1:8000/api/1.0/video/JVoMAa3kaWzq/?format=xml'</em>
        or <em>'http://127.0.0.1:8000/api/1.0/video/JVoMAa3kaWzq/?format=yaml'</em>        
        """
        video = None
        
        if video_id:
            try:
                video = self.queryset(request).get(video_id=video_id)
            except Video.DoesNotExist:
                pass
        else:
            video = request.form.save()
            if request.form.created and request.user.is_authenticated():
                video.user = request.user
                video.save()
        print video.user
        if not video:
            return rc.NOT_FOUND
        else:
            return video
    
    def test_update(self, request, video_id):
        """
        <em>curl "http://127.0.0.1:8000/api/1.0/video/0zaZ2GPv3o9m/?username=admin&password=admin" -F 'title=new-title' -X 'PUT'</em>
        """
        
        try:
            video = self.queryset(request).get(video_id=video_id)
        except Video.DoesNotExist:
            return rc.NOT_FOUND
        
        return video

class AnonymousVideoHandler(VideoHandler, AnonymousBaseHandler):
    pass

class SubtitleHandler(BaseHandler):
    
    allowed_methods = ('POST',)
    
    @validate(AddSubtitlesForm)
    def create(self, request):
        """
        Add subtitles for video.
        
        Send in request:
        <b>video:</b> video_id
        <b>video_language:</b> language of video
        <b>language:</b> language of subtitles
        <b>format</b>: format of subtitles(srt, ass, ssa, ttml, sbv)
        <b>subtitles</b>: subtitles(max size 256kB. Can be less, not tested with big content)
        
        <em>curl "http://127.0.0.1:8000/api/1/subtitles/?username=admin&password=admin" -d 'video=0zaZ2GPv3o9m' -d 'video_language=en' -d 'language=ru' -d 'format=srt' -d 'subtitles=1%0A00:00:01,46 --> 00:00:03,05%0Atest'</em>
        """
        request.form.save()
        return rc.ALL_OK