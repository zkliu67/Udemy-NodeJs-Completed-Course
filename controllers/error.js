exports.get404 = (req, res, next) => {
  res.status(404).render('404', {path: req.url, pageTitle: '404 NOT FOUND'});
}