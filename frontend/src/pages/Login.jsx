@@
 import { useState } from 'react'
 import { Link, useNavigate } from 'react-router-dom'
 import { useAuth } from '../context/AuthContext'
-import GasBottle from '../components/ui/GasBottle'
+import GasBottle from '../components/ui/GasBottle'
+import Icon from '../components/ui/Icons'
 import toast from 'react-hot-toast'
@@
-          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '20px', alignItems: 'flex-end' }}>
-            {[['#E53935',6,'Oryx'], ['#f97c0a',12.5,'Total'], ['#16a34a',25,'Bénin']].map(([c,p,m],i) => (
-              <div key={i} style={{ animation: `float ${3+i*0.5}s ease-in-out ${i*0.2}s infinite`, transform: i===1?'none':'translateY(8px)' }}>
-                <GasBottle color={c} poids={p} size={i===1?60:44} marque={m} />
-              </div>
-            ))}
-          </div>
+          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '20px', alignItems: 'flex-end' }}>
+            {[['#E53935',6,'Oryx'], ['#f97c0a',12.5,'Total'], ['#16a34a',25,'Bénin']].map(([c,p,m],i) => (
+              <div key={i} style={{ animation: `float ${3+i*0.5}s ease-in-out ${i*0.2}s infinite`, transform: i===1?'none':'translateY(8px)' }}>
+                <GasBottle color={c} poids={p} size={i===1?60:44} marque={m} />
+              </div>
+            ))}
+          </div>
@@
-                <button type="button" onClick={() => setShowPwd(v => !v)} style={{
-                  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
-                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-dim)', fontSize: '1rem',
-                }}>{showPwd ? '🙈' : '👁️'}</button>
+                <button type="button" onClick={() => setShowPwd(v => !v)} style={{
+                  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
+                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-dim)', fontSize: '1rem',
+                }} aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
+                  <Icon name={showPwd ? 'eye-off' : 'eye'} size={18} />
+                </button>
@@
-            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '4px' }} disabled={loading}>
-              {loading ? '⏳ Connexion…' : 'Se connecter →'}
-            </button>
+            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '4px', display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8 }} disabled={loading}>
+              {loading ? <><Icon name="loader" className="animate-spin" size={16} /> Connexion…</> : <>Se connecter <span style={{opacity:0.9}}>→</span></>}
+            </button>
           </form>
@@
   )
 }
