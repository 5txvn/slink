exports.logOutUser = async (req, res) => {
    delete req.session.username;
    delete req.session.email;
    res.redirect('/authenticate');
}