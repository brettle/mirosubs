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

#  Based on: http://www.djangosnippets.org/snippets/73/
#
#  Modified by Sean Reifschneider to be smarter about surrounding page
#  link context.  For usage documentation see:
#
#     http://www.tummy.com/Community/Articles/django-pagination/
from django.conf.urls.defaults import *

urlpatterns = patterns('teams.views',
    url('^$', 'index', name='index'),
    url('^create/$', 'create', name='create'),
    url('^edit/(?P<pk>\d+)/$', 'edit', name='edit'),
    url('^aplications/(?P<pk>\d+)/$', 'aplications', name='aplications'),
    url('^edit/video/(?P<pk>\d+)/$', 'edit_video', name='edit_video'),
    url('^edit/members/(?P<pk>\d+)/$', 'edit_members', name='edit_members'),
    url('^remove/video/(?P<pk>\d+)/(?P<video_pk>\d+)/$', 'remove_video', name='remove_video'),
    url('^remove/members/(?P<pk>\d+)/(?P<user_pk>\d+)/$', 'remove_member', name='remove_member'),
    url('^demote/members/(?P<pk>\d+)/(?P<user_pk>\d+)/$', 'demote_member', name='demote_member'),
    url('^promote/members/(?P<pk>\d+)/(?P<user_pk>\d+)/$', 'promote_member', name='promote_member'),
    url('^(?P<pk>\d+)/$', 'detail', name='detail'),
)