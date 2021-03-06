#!/usr/bin/env python
#
# Copyright 2013 Chris Wood
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import os

import jinja2

import key

from base import AuthenticatedHandler


# setup jinja template env

jinja_environment = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__))
)

admin_error_template = jinja_environment.get_template('admin_error.html')


# define base class

class AdminAuthenticatedHandler(AuthenticatedHandler):

    # options for overriding

    accessible_to_local_admin = True


    def __init__(self, *args, **kwargs):
        # load jinja template if specified as class var
        if hasattr(self, 'template'):
            self.jinja_template = jinja_environment.get_template(self.template)
        super(AdminAuthenticatedHandler, self).__init__(*args, **kwargs)

    def dispatch(self, *args, **kwargs):
        " Redirect or forbid if not authorised. "
        org, event = key.CheckAuthorization(self.request)
        if not org:
            # redirect to login
            self.redirect('/authentication?destination=%s' % self.request.path)
            return
        elif not (org.is_admin or org.is_global_admin):
            # forbid
            self.abort(403)

        if not self.accessible_to_local_admin and org.is_local_admin:
            self.response.out.write(
                admin_error_template.render(
                    message=u"This page is not accessible to local admins."
                )
            )
            return

        # continue with dispatch
        super(AdminAuthenticatedHandler, self).dispatch(*args, **kwargs)

    def render(self, **kwargs):
        " Render jinja template to response out. "
        self.response.out.write(
            self.jinja_template.render(kwargs)
        )
