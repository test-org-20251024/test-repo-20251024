/ ====================================
// Firebase Data Service
// Firestoreとのすべてのデータ操作を管理
// ====================================

import { auth, db } from './firebase-config.js';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

class FirebaseService {
  constructor() {
    this.currentUser = null;
    
    // 認証状態の監視
    auth.onAuthStateChanged((user) => {
      this.currentUser = user;
      console.log('Auth state changed:', user ? user.email : 'Not logged in');
    });
  }

  // ====================================
  // ユーザー管理
  // ====================================

  /**
   * 現在のユーザー情報を取得
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * ユーザーがログインしているかチェック
   */
  isLoggedIn() {
    return this.currentUser !== null;
  }

  /**
   * ユーザープロファイルを取得
   */
  async getUserProfile() {
    if (!this.currentUser) {
      throw new Error('ログインしてください');
    }

    const docRef = doc(db, 'users', this.currentUser.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  }

  /**
   * ユーザープロファイルを作成・更新
   */
  async setUserProfile(profileData) {
    if (!this.currentUser) {
      throw new Error('ログインしてください');
    }

    const docRef = doc(db, 'users', this.currentUser.uid);
    await setDoc(docRef, {
      ...profileData,
      email: this.currentUser.email,
      updatedAt: serverTimestamp()
    }, { merge: true });

    console.log('User profile updated');
  }

  // ====================================
  // 顧客データ管理
  // ====================================

  /**
   * 顧客を追加
   */
  async addCustomer(customerData) {
    if (!this.currentUser) {
      throw new Error('ログインしてください');
    }

    // 顧客数制限チェック
    const profile = await this.getUserProfile();
    const customers = await this.getCustomers();
    
    const maxCustomers = profile?.maxCustomers || 10; // デフォルトはFree版の10人
    
    if (customers.length >= maxCustomers) {
      throw new Error(`顧客数の上限（${maxCustomers}名）に達しています`);
    }

    const customersRef = collection(db, 'users', this.currentUser.uid, 'customers');
    const docRef = await addDoc(customersRef, {
      ...customerData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log('Customer added:', docRef.id);
    return docRef.id;
  }

  /**
   * 顧客データを更新
   */
  async updateCustomer(customerId, customerData) {
    if (!this.currentUser) {
      throw new Error('ログインしてください');
    }

    const docRef = doc(db, 'users', this.currentUser.uid, 'customers', customerId);
    await updateDoc(docRef, {
      ...customerData,
      updatedAt: serverTimestamp()
    });

    console.log('Customer updated:', customerId);
  }

  /**
   * 顧客を削除
   */
  async deleteCustomer(customerId) {
    if (!this.currentUser) {
      throw new Error('ログインしてください');
    }

    const docRef = doc(db, 'users', this.currentUser.uid, 'customers', customerId);
    await deleteDoc(docRef);

    console.log('Customer deleted:', customerId);
  }

  /**
   * 全顧客を取得
   */
  async getCustomers() {
    if (!this.currentUser) {
      throw new Error('ログインしてください');
    }

    const customersRef = collection(db, 'users', this.currentUser.uid, 'customers');
    const q = query(customersRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const customers = [];
    querySnapshot.forEach((doc) => {
      customers.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log('Customers loaded:', customers.length);
    return customers;
  }

  /**
   * 特定の顧客を取得
   */
  async getCustomer(customerId) {
    if (!this.currentUser) {
      throw new Error('ログインしてください');
    }

    const docRef = doc(db, 'users', this.currentUser.uid, 'customers', customerId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      return null;
    }
  }

  // ====================================
  // 描画データ管理
  // ====================================

  /**
   * 描画データを保存
   */
  async saveDrawing(customerId, drawingData) {
    if (!this.currentUser) {
      throw new Error('ログインしてください');
    }

    const docRef = doc(db, 'users', this.currentUser.uid, 'drawings', customerId);
    await setDoc(docRef, {
      customerId: customerId,
      drawingData: drawingData,
      updatedAt: serverTimestamp()
    });

    console.log('Drawing saved:', customerId);
  }

  /**
   * 描画データを取得
   */
  async getDrawing(customerId) {
    if (!this.currentUser) {
      throw new Error('ログインしてください');
    }

    const docRef = doc(db, 'users', this.currentUser.uid, 'drawings', customerId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().drawingData;
    } else {
      return null;
    }
  }

  /**
   * 描画データを削除
   */
  async deleteDrawing(customerId) {
    if (!this.currentUser) {
      throw new Error('ログインしてください');
    }

    const docRef = doc(db, 'users', this.currentUser.uid, 'drawings', customerId);
    await deleteDoc(docRef);

    console.log('Drawing deleted:', customerId);
  }

  // ====================================
  // バックアップ履歴
  // ====================================

  /**
   * バックアップ履歴を保存
   */
  async saveBackupHistory(backupInfo) {
    if (!this.currentUser) {
      throw new Error('ログインしてください');
    }

    const historyRef = collection(db, 'users', this.currentUser.uid, 'backupHistory');
    await addDoc(historyRef, {
      ...backupInfo,
      createdAt: serverTimestamp()
    });

    console.log('Backup history saved');
  }

  /**
   * バックアップ履歴を取得
   */
  async getBackupHistory(limitCount = 10) {
    if (!this.currentUser) {
      throw new Error('ログインしてください');
    }

    const historyRef = collection(db, 'users', this.currentUser.uid, 'backupHistory');
    const q = query(historyRef, orderBy('createdAt', 'desc'), limit(limitCount));
    const querySnapshot = await getDocs(q);

    const history = [];
    querySnapshot.forEach((doc) => {
      history.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return history;
  }

  // ====================================
  // バグ報告
  // ====================================

  /**
   * バグ報告を保存
   */
  async saveBugReport(reportData) {
    if (!this.currentUser) {
      throw new Error('ログインしてください');
    }

    const reportsRef = collection(db, 'users', this.currentUser.uid, 'bugReports');
    await addDoc(reportsRef, {
      ...reportData,
      createdAt: serverTimestamp()
    });

    console.log('Bug report saved');
  }

  // ====================================
  // お客様記入フォーム
  // ====================================

  /**
   * お客様記入フォームを保存
   */
  async saveCustomerForm(formData) {
    // お客様記入フォームは認証不要
    const formsRef = collection(db, 'customerForms');
    const docRef = await addDoc(formsRef, {
      ...formData,
      createdAt: serverTimestamp()
    });

    console.log('Customer form saved:', docRef.id);
    return docRef.id;
  }
}

// シングルトンインスタンスを作成
const firebaseService = new FirebaseService();

// エクスポート
export default firebaseService;
