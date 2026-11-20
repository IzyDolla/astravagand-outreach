// Fake supabase-js (nur Auth) für lokale UI-Tests
window.supabase={createClient(){let s=null;try{s=JSON.parse(localStorage.getItem('fake_sess'))}catch(e){}
 const auth={async getSession(){return{data:{session:s}}},async getUser(){return{data:{user:s&&s.user}}},
  async signInWithPassword({email,password}){const r=await fetch('/__login',{method:'POST',body:JSON.stringify({email,password})});const j=await r.json();if(!j.ok)return{error:{message:'Invalid login credentials'}};s={access_token:j.token,user:j.user};localStorage.setItem('fake_sess',JSON.stringify(s));return{data:{session:s}}},
  async signOut(){s=null;localStorage.removeItem('fake_sess');return{}},onAuthStateChange(){},async refreshSession(){return{}},async updateUser(){return{data:{}}},
  mfa:{async getAuthenticatorAssuranceLevel(){return{data:{currentLevel:'aal1',nextLevel:'aal1'}}},async listFactors(){return{data:{totp:[],all:[]}}},
   async enroll(){return{data:{id:'f1',totp:{qr_code:'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10"/></svg>',secret:'JBSWY3DPEHPK3PXP'}}}},async challengeAndVerify(){return{data:{}}},async unenroll(){return{}}}};
 return{auth}}};
