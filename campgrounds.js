// This is the code of https://github.com/nax3t/image_upload_example/tree/edit-delete
// from the original youtube video https://www.youtube.com/watch?v=RHd4rP9U9SA
// This code has additionally  added google maps included

//CREATE NEW CAMPGROUND
router.post("/campgrounds", middleware.isLoggedIn, upload.single('image'), function (req, res) {
  // geocoder configuration
    geocoder.geocode(req.body.location, function (err, data) {
     if (err || !data.length) {
       req.flash('error', 'Invalid address');
       return res.redirect('back');
     }
     req.body.campground.lat = data[0].latitude;
     req.body.campground.lng = data[0].longitude;
     req.body.campground.location = data[0].formattedAddress;
    // cloudinary configuration
    cloudinary.uploader.upload(req.file.path, function (result) {
      // add cloudinary url for the image to the campground object under image property
      req.body.party.image = result.secure_url;
      // add author to campground
      req.body.campground.author = {
        id: req.user._id,
        username: req.user.username
      };
      // add to the campground model
      Campground.create(req.body.party, function (err, party) {
        if (err) {
          req.flash('failure', err.message);
          return res.redirect('back');
        }
        res.redirect('/campgrounds/' + campground.id);
      });
    });
  });
});﻿
