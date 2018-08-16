// This is the code of https://github.com/nax3t/image_upload_example/tree/edit-delete
// from the original youtube video https://www.youtube.com/watch?v=RHd4rP9U9SA part 1 & https://www.youtube.com/watch?v=U0GSOkbHW5o&t part 2
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
      req.body.campground.image = result.secure_url;
      // add author to campground
      req.body.campground.author = {
        id: req.user._id,
        username: req.user.username
      };
      // add to the campground model
      Campground.create(req.body.campground, function (err, campground) {
        if (err) {
          req.flash('failure', err.message);
          return res.redirect('back');
        }
        res.redirect('/campgrounds/' + campground.id);
      });
    });
  });
});﻿

//UPDATE CAMPGROUND
router.put("/campgrounds/:id", middleware.checkCampgroundOwnership, upload.single("image"),  function(req, res){
    Campground.findById(req.params.id, function(err, campground){
      //google maps
      geocoder.geocode(req.body.location, async function (err, data) {
       if (err || !data.length) {
         req.flash('error', 'Invalid address');
         return res.redirect('back');
       }
       campground.lat = data[0].latitude;
       campground.lng = data[0].longitude;
       campground.location = data[0].formattedAddress;
       //end of google maps
      if(err){
        req.flash("error", err.message);
        res.redirect("back");
      } else {
        if(req.file) {
          try{
            await cloudinary.v2.uploader.destroy(campground.imageId);
            var result = await cloudinary.v2.uploader.upload(req.file.path);
            campground.imageId = result.public_id;
            campground.image = result.secure_url;
          } catch(err){
            req.flash("error", err.message);
            return res.redirect("back");
          }
        }
        campground.name = req.body.campground.name;
        campground.description = req.body.campground.description;
        campground.save();
        req.flash("success","Successfully Updated!");
        res.redirect("/parties/" + req.params.id);
        }
      });
  });
});
