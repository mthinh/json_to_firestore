const admin = require('firebase-admin');
const users = require('./backed_up/users_setting.json');
const posts = require('./backed_up/users_posts.json');
const areas = require('./domain_json/areas.json');

function modifyPost(oldPost) {
  const currentArea = areas.find((area) => area.name === oldPost.area_name);
  const newPost = {
    id: oldPost.id,
    status: oldPost.id.includes('draft') ? 'draft' : 'published',
    description: oldPost.description,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
    img_url: null,
    area: {
      id: oldPost.area_name.toLowerCase(),
      name: oldPost.area_name,
      type: oldPost.area_name.includes('S')
        ? 'scope'
        : oldPost.area_name.includes('E')
        ? 'expertise'
        : 'mindset',
      description: currentArea.description,
      band_id: currentArea.band_id,
      rating: 0,
      number_of_posts: 0,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    },
  };
  return newPost;
}

function migratePosts() {
  const firestore = admin.firestore();

  users.forEach((user) => {
    const userId = user.id;
    const newPosts = posts.reduce((list, post) => {
      if (post.user_id === userId) {
        const modifiedPost = modifyPost(post);
        list.push(modifiedPost);
        return list;
      }
      return list;
    }, []);

    // Write posts
    newPosts.forEach((post) => {
      firestore
        .collection('users')
        .doc(userId)
        .collection('posts')
        .doc(post.id)
        .set(post);
    });

    const userAreas = {};

    // Calculate number of posts for each area
    newPosts.forEach((post) => {
      userAreas[post.area.id] = {
        ...post.area,
        number_of_posts:
          userAreas[post.area.id] == null
            ? 1
            : userAreas[post.area.id].number_of_posts + 1,
      };
    });

    // Update area of the post
    newPosts.forEach((post) => {
      firestore
        .collection('users')
        .doc(userId)
        .collection('posts')
        .doc(post.id)
        .update({
          'area.number_of_posts': userAreas[post.area.id].number_of_posts,
        });
    });
  });
}

module.exports = migratePosts;
