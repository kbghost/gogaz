@@
-import { useState, useEffect } from 'react'
-import { Link, useNavigate } from 'react-router-dom'
-import { useQuery } from '@tanstack/react-query'
-import { useAuth } from '../../context/AuthContext'
-import Navbar from '../../components/ui/Navbar'
-import HeroSlider from '../../components/ui/HeroSlider'
-import ProductImage from '../../components/ui/ProductImage'
-import { produitAPI } from '../../services/api'
-import { formatPrix, marqueColors } from '../../utils/helpers'
+import { useState, useEffect } from 'react'
+import { Link, useNavigate } from 'react-router-dom'
+import { useQuery } from '@tanstack/react-query'
+import { useAuth } from '../../context/AuthContext'
+import Navbar from '../../components/ui/Navbar'
+import HeroSlider from '../../components/ui/HeroSlider'
+import ProductImage from '../../components/ui/ProductImage'
+import Icon from '../../components/ui/Icons'
+import { produitAPI } from '../../services/api'
+import { formatPrix, marqueColors } from '../../utils/helpers'
@@
-const STEPS = [
-  { n: '01', icon: '⛽', title: 'Choisissez', desc: 'Marque + format de bouteille' },
-  { n: '02', icon: '📍', title: 'Localisez', desc: 'GPS automatique ou carte' },
-  { n: '03', icon: '✅', title: 'Confirmez', desc: 'Paiement cash à livraison' },
-  { n: '04', icon: '🚀', title: 'Recevez', desc: 'Livreur tracé en temps réel' },
-]
-
-const STATS = [
-  { val: '500+', label: 'Clients satisfaits', icon: '👥' },
-  { val: '<30min', label: 'Délai de livraison', icon: '⚡' },
-  { val: '4', label: 'Marques disponibles', icon: '⛽' },
-  { val: '24/7', label: 'Service actif', icon: '🕐' },
-]
+const STEPS = [
+  { n: '01', icon: 'cart', title: 'Choisissez', desc: 'Marque + format de bouteille' },
+  { n: '02', icon: 'map-pin', title: 'Localisez', desc: 'GPS automatique ou carte' },
+  { n: '03', icon: 'check', title: 'Confirmez', desc: 'Paiement cash à livraison' },
+  { n: '04', icon: 'zap', title: 'Recevez', desc: 'Livreur tracé en temps réel' },
+]
+
+const STATS = [
+  { val: '500+', label: 'Clients satisfaits', icon: 'users' },
+  { val: '<30min', label: 'Délai de livraison', icon: 'zap' },
+  { val: '4', label: 'Marques disponibles', icon: 'cart' },
+  { val: '24/7', label: 'Service actif', icon: 'clock' },
+]
@@
-          {STATS.map((s, i) => (
-            <div key={i} style={{ textAlign: 'center' }}>
-              <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>{s.icon}</div>
-              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--c-brand)' }}>{s.val}</div>
-              <div style={{ color: 'var(--c-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-body)' }}>{s.label}</div>
-            </div>
-          ))}
+          {STATS.map((s, i) => (
+            <div key={i} style={{ textAlign: 'center' }}>
+              <div style={{ fontSize: '1.4rem', marginBottom: '4px', color: 'var(--c-muted)' }}>
+                <Icon name={s.icon} size={28} />
+              </div>
+              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--c-brand)' }}>{s.val}</div>
+              <div style={{ color: 'var(--c-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-body)' }}>{s.label}</div>
+            </div>
+          ))}
@@
-              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
-              <button onClick={goCommander} className="btn-primary glow" style={{ fontSize: '1rem', padding: '14px 28px' }}>
-                ⛽ Commander maintenant
-              </button>
-              <Link to="/tarifs" className="btn-secondary" style={{ fontSize: '1rem', padding: '14px 22px' }}>
-                Voir les tarifs
-              </Link>
-            </div>
+            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
+              <button onClick={goCommander} className="btn-primary glow" style={{ fontSize: '1rem', padding: '14px 28px', display:'inline-flex', alignItems:'center', gap:8 }}>
+                <Icon name="cart" size={18} /> Commander maintenant
+              </button>
+              <Link to="/tarifs" className="btn-secondary" style={{ fontSize: '1rem', padding: '14px 22px' }}>
+                Voir les tarifs
+              </Link>
+            </div>
@@
-            {STEPS.map((s) => (
-              <div key={s.n} style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: '18px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
-                <div style={{ position: 'absolute', top: '-8px', right: '-2px', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '4.5rem', color: 'rgba(249,124,10,0.06)', lineHeight: 1,[...]
-                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(249,124,10,0.1)', border: '1px solid rgba(249,124,10,0.2)', display: 'flex', alignItems: 'cent[...]
-                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--c-brand)', marginBottom: '6px', letterSpacing: '0.06em' }}>ÉTAPE {s.n}</div>
-                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--c-text)', marginBottom: '6px' }}>{s.title}</h3>
-                <p style={{ color: 'var(--c-muted)', fontSize: '0.83rem', lineHeight: 1.6, fontFamily: 'var(--font-body)' }}>{s.desc}</p>
-              </div>
-            ))}
+            {STEPS.map((s) => (
+              <div key={s.n} style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: '18px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
+                <div style={{ position: 'absolute', top: '-8px', right: '-2px', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '4.5rem', color: 'rgba(249,124,10,0.06)', lineHeight: 1 }}>{s.n}</div>
+                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(249,124,10,0.1)', border: '1px solid rgba(249,124,10,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
+                  <Icon name={s.icon} size={20} />
+                </div>
+                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--c-brand)', marginBottom: '6px', letterSpacing: '0.06em' }}>ÉTAPE {s.n}</div>
+                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--c-text)', marginBottom: '6px' }}>{s.title}</h3>
+                <p style={{ color: 'var(--c-muted)', fontSize: '0.83rem', lineHeight: 1.6, fontFamily: 'var(--font-body)' }}>{s.desc}</p>
+              </div>
+            ))}
@@
-              <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
-               {['🔧', '🟫', '🔥'].map((icon, i) => (
-                 <div key={i} style={{
-                   width: '60px', height: '60px', borderRadius: '16px',
-                   background: 'var(--c-border)', border: '1px solid var(--c-border2)',
-                   display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem',
-                   animation: `float ${3 + i * 0.4}s ease-in-out ${i * 0.3}s infinite`,
-                 }}>{icon}</div>
-               ))}
-             </div>
+              <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
+                {[{i:'tool', color: 'var(--c-border)'}, {i:'circle', color:'#a16207'}, {i:'fire', color:'#f97316'}].map((icon, i) => (
+                  <div key={i} style={{
+                    width: '60px', height: '60px', borderRadius: '16px',
+                    background: 'var(--c-border)', border: '1px solid var(--c-border2)',
+                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem',
+                    animation: `float ${3 + i * 0.4}s ease-in-out ${i * 0.3}s infinite`,
+                  }}>
+                    <Icon name={icon.i} size={26} color={icon.color} />
+                  </div>
+                ))}
+              </div>
@@
-          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--c-dim)' }}>
-            🏍️ GoGaz <span style={{ fontWeight: 400, opacity: 0.6 }}>Bénin</span>
-          </div>
+          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--c-dim)', display: 'flex', alignItems: 'center', gap:8 }}>
+            <Icon name="truck" size={18} /> <span>GoGaz <span style={{ fontWeight: 400, opacity: 0.6 }}>Bénin</span></span>
+          </div>
@@
 }
