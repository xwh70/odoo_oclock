# -*- coding: utf-8 -*-
# from odoo import http


# class OdooOclock(http.Controller):
#     @http.route('/odoo_oclock/odoo_oclock/', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/odoo_oclock/odoo_oclock/objects/', auth='public')
#     def list(self, **kw):
#         return http.request.render('odoo_oclock.listing', {
#             'root': '/odoo_oclock/odoo_oclock',
#             'objects': http.request.env['odoo_oclock.odoo_oclock'].search([]),
#         })

#     @http.route('/odoo_oclock/odoo_oclock/objects/<model("odoo_oclock.odoo_oclock"):obj>/', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('odoo_oclock.object', {
#             'object': obj
#         })
