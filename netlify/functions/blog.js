const { db } = require('./config/firebase.js');
const {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} = require('firebase/firestore');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

const getBySlug = async (slug) => {
  const postsRef = collection(db, 'blogPosts');
  const q = query(postsRef, where('slug', '==', slug), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
};

exports.handler = async (event) => {
  try {
    // CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers, body: '' };
    }

    const method = event.httpMethod;
    const pathSegments = event.path.split('/').filter(Boolean);
    const last = pathSegments[pathSegments.length - 1];

    // GET /blog -> list (optional filters: published, tag, search)
    if (method === 'GET' && last === 'blog') {
      const params = event.queryStringParameters || {};
      const publishedParam = params.published;
      const tag = params.tag?.trim();
      const search = params.search?.trim();
    
      let qRef = collection(db, 'blogPosts');
      let qExec = query(qRef, orderBy('createdAt', 'desc'));
    
      // جلب جميع المقالات أولاً ثم الفلترة
      const snap = await getDocs(qExec);
      let posts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    
      // فلترة المقالات المنشورة
      if (publishedParam === 'true') {
        posts = posts.filter(p => p.published === true);
      } else if (publishedParam === 'false') {
        posts = posts.filter(p => p.published === false);
      }
    
      // فلترة حسب الوسم
      if (tag) {
        posts = posts.filter(p => p.tags && p.tags.includes(tag));
      }
    
      // البحث النصي
      if (search) {
        const s = search.toLowerCase();
        posts = posts.filter(
          (p) =>
            (p.title || '').toLowerCase().includes(s) ||
            (p.content || '').toLowerCase().includes(s)
        );
      }
    
      return { statusCode: 200, headers, body: JSON.stringify(posts) };
    }

    // GET /blog/:idOrSlug
    if (method === 'GET' && pathSegments.includes('blog') && last !== 'blog') {
      const idOrSlug = decodeURIComponent(last);
      // try by id
      const dref = doc(db, 'blogPosts', idOrSlug);
      const dsnap = await getDoc(dref);
      if (dsnap.exists()) {
        return { statusCode: 200, headers, body: JSON.stringify({ id: dsnap.id, ...dsnap.data() }) };
      }
      // fallback by slug
      const bySlug = await getBySlug(idOrSlug);
      if (!bySlug) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'المقال غير موجود' }) };
      }
      return { statusCode: 200, headers, body: JSON.stringify(bySlug) };
    }

    // POST /blog -> create
    if (method === 'POST' && last === 'blog') {
      const body = event.body ? JSON.parse(event.body) : {};
      const { title, slug, content, coverImageUrl, tags = [], author = 'Admin', readTime = 3, published = true, metaDescription = '' } = body;

      if (!title || !slug) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'العنوان وslug مطلوبان' }) };
      }

      // unique slug
      const exists = await getBySlug(slug);
      if (exists) {
        return { statusCode: 409, headers, body: JSON.stringify({ error: 'Slug موجود بالفعل' }) };
      }

      const now = new Date().toISOString();
      const payload = {
        title,
        slug,
        content: content || '',
        coverImageUrl: coverImageUrl || '',
        tags: Array.isArray(tags) ? tags : [],
        author,
        readTime,
        published,
        metaDescription,
        createdAt: now,
        updatedAt: now,
      };

      const postsRef = collection(db, 'blogPosts');
      const res = await addDoc(postsRef, payload);
      return { statusCode: 201, headers, body: JSON.stringify({ id: res.id, ...payload }) };
    }

    // PUT /blog/:id
    if (method === 'PUT' && pathSegments.includes('blog') && last !== 'blog') {
      const id = decodeURIComponent(last);
      const body = event.body ? JSON.parse(event.body) : {};
      const dref = doc(db, 'blogPosts', id);
      const dsnap = await getDoc(dref);
      if (!dsnap.exists()) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'المقال غير موجود' }) };
      }

      const data = dsnap.data();
      const update = { ...body, updatedAt: new Date().toISOString() };

      // handle slug uniqueness if changed
      if (body.slug && body.slug !== data.slug) {
        const exists = await getBySlug(body.slug);
        if (exists) {
          return { statusCode: 409, headers, body: JSON.stringify({ error: 'Slug موجود بالفعل' }) };
        }
      }

      await updateDoc(dref, update);
      return { statusCode: 200, headers, body: JSON.stringify({ id, ...data, ...update }) };
    }

    // DELETE /blog/:id
    if (method === 'DELETE' && pathSegments.includes('blog') && last !== 'blog') {
      const id = decodeURIComponent(last);
      const dref = doc(db, 'blogPosts', id);
      const dsnap = await getDoc(dref);
      if (!dsnap.exists()) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'المقال غير موجود' }) };
      }
      await deleteDoc(dref);
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 404, headers, body: JSON.stringify({ error: 'المسار غير معروف' }) };
  } catch (e) {
    console.error('Blog function error:', e);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'خطأ داخلي في السيرفر' }) };
  }
};