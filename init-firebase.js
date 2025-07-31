// Firebase Initialization Script
// هذا الملف يقوم بتهيئة Firebase بالبيانات الأولية للمتجر

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';

// Firebase configuration - يجب تحديث هذه البيانات بمشروعك الحقيقي
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initial data
const initialProducts = [
  {
    name: 'وشاح التخرج الكلاسيكي',
    description: 'وشاح تخرج أنيق باللون الأسود مع تطريز ذهبي، مصنوع من أفضل الخامات',
    price: 85.00,
    stock: 50,
    category: 'graduation-sashes',
    images: ['graduation-sash-1.jpg'],
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'عباءة التخرج الأكاديمية',
    description: 'عباءة تخرج رسمية للمراسم الأكاديمية، متوفرة بأحجام مختلفة',
    price: 180.00,
    stock: 30,
    category: 'graduation-gowns',
    images: ['graduation-gown-1.jpg'],
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    name: 'زي مدرسي موحد',
    description: 'زي مدرسي عالي الجودة، مريح ومتين، متوفر بألوان مختلفة',
    price: 120.00,
    stock: 100,
    category: 'school-uniforms',
    images: ['school-uniform-1.jpg'],
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

const initialCategories = [
  {
    name: 'أوشحة التخرج',
    description: 'أوشحة تخرج أنيقة بألوان وتصاميم متنوعة',
    image: 'categories/graduation-sashes.jpg',
    createdAt: new Date().toISOString()
  },
  {
    name: 'عبايات التخرج',
    description: 'عبايات تخرج رسمية للمراسم الأكاديمية',
    image: 'categories/graduation-gowns.jpg',
    createdAt: new Date().toISOString()
  },
  {
    name: 'الأزياء المدرسية',
    description: 'ملابس مدرسية عالية الجودة ومريحة',
    image: 'categories/school-uniforms.jpg',
    createdAt: new Date().toISOString()
  },
  {
    name: 'كاب التخرج',
    description: 'كاب تخرج أكاديمي بتصاميم مختلفة',
    image: 'categories/graduation-caps.jpg',
    createdAt: new Date().toISOString()
  },
  {
    name: 'إكسسوارات التخرج',
    description: 'إكسسوارات مكملة لإطلالة التخرج المثالية',
    image: 'categories/graduation-accessories.jpg',
    createdAt: new Date().toISOString()
  }
];

const initialCoupons = [
  {
    name: 'خصم الطلاب الجدد',
    code: 'WELCOME10',
    description: 'خصم 10% على أول طلب للطلاب الجدد',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 100,
    maxDiscountAmount: 50,
    usageLimit: 100,
    usedCount: 0,
    isActive: true,
    validFrom: new Date().toISOString(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    applicableCategories: [],
    applicableProducts: [],
    createdAt: new Date().toISOString()
  },
  {
    name: 'خصم التخرج الذهبي',
    code: 'GRAD25',
    description: 'خصم 25% على منتجات التخرج',
    discountType: 'percentage',
    discountValue: 25,
    minOrderAmount: 200,
    maxDiscountAmount: 100,
    usageLimit: 50,
    usedCount: 0,
    isActive: true,
    validFrom: new Date().toISOString(),
    validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days
    applicableCategories: [],
    applicableProducts: [],
    createdAt: new Date().toISOString()
  }
];

// Function to initialize Firebase collections
async function initializeFirebase() {
  console.log('🚀 Starting Firebase initialization...');
  
  try {
    // Check if collections already have data
    console.log('📋 Checking existing data...');
    
    const productsSnapshot = await getDocs(collection(db, 'products'));
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    const couponsSnapshot = await getDocs(collection(db, 'coupons'));
    
    console.log(`Found ${productsSnapshot.size} products, ${categoriesSnapshot.size} categories, ${couponsSnapshot.size} coupons`);
    
    // Add initial products if none exist
    if (productsSnapshot.empty) {
      console.log('📦 Adding initial products...');
      for (const product of initialProducts) {
        await addDoc(collection(db, 'products'), product);
        console.log(`✅ Added product: ${product.name}`);
      }
    } else {
      console.log('📦 Products already exist, skipping...');
    }
    
    // Add initial categories if none exist
    if (categoriesSnapshot.empty) {
      console.log('📂 Adding initial categories...');
      for (const category of initialCategories) {
        await addDoc(collection(db, 'categories'), category);
        console.log(`✅ Added category: ${category.name}`);
      }
    } else {
      console.log('📂 Categories already exist, skipping...');
    }
    
    // Add initial coupons if none exist
    if (couponsSnapshot.empty) {
      console.log('🎫 Adding initial coupons...');
      for (const coupon of initialCoupons) {
        await addDoc(collection(db, 'coupons'), coupon);
        console.log(`✅ Added coupon: ${coupon.name}`);
      }
    } else {
      console.log('🎫 Coupons already exist, skipping...');
    }
    
    console.log('🎉 Firebase initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error);
  }
}

// Run initialization if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeFirebase();
}

export { initializeFirebase }; 