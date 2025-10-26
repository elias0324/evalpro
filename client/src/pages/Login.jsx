import React, { useState } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

const Login = () => {
  const navigate = useNavigate()
  const [state, setState] = useState('Sign Up')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    academicGrade: 'DOCTORANT',
    institution: 'UNIVERSITE_TLEMCEN_ABOU_BAKR_BELKAID'
  })

  const academicGrades = [
    { value: 'PROFESSEUR', label: 'Professeur' },
    { value: 'MAITRE_DE_CONFERENCES_CLASSE_A', label: 'Maître de conférences A' },
    { value: 'MAITRE_DE_CONFERENCES_CLASSE_B', label: 'Maître de conférences B' },
    { value: 'MAITRE_ASSISTANT_CLASSE_A', label: 'Maître assistant A' },
    { value: 'MAITRE_ASSISTANT_CLASSE_B', label: 'Maître assistant B' },
    { value: 'DOCTORANT', label: 'Doctorant' },
    { value: 'PERSONNEL_ADMINISTRATIF', label: 'Personnel administratif' }
  ]

  const institutions = [
    { value: 'UNIVERSITE_TLEMCEN_ABOU_BAKR_BELKAID', label: 'Université de Tlemcen - Abou Bakr Belkaïd' },
    { value: 'UNIVERSITE_ORAN_1', label: "Université d'Oran 1 - Ahmed Ben Bella" },
    { value: 'UNIVERSITE_ORAN_2', label: "Université d'Oran 2 - Mohamed Ben Ahmed" },
    { value: 'UNIVERSITE_ALGER_1', label: "Université d'Alger 1 - Benyoucef Benkhedda" },
    { value: 'UNIVERSITE_ALGER_2', label: "Université d'Alger 2 - Abou El Kacem Saâdallah" },
    { value: 'UNIVERSITE_ALGER_3', label: "Université d'Alger 3 - Brahim Sultan El Ibrahimi" },
    { value: 'UNIVERSITE_CONSTANTINE_1', label: 'Université de Constantine 1 - Frères Mentouri' },
    { value: 'UNIVERSITE_CONSTANTINE_2', label: 'Université de Constantine 2 - Abdelhamid Mehri' },
    { value: 'UNIVERSITE_CONSTANTINE_3', label: 'Université de Constantine 3 - Salah Boubnider' },
    { value: 'AUTRE', label: 'Autre institution' }
  ]

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Le mot de passe doit contenir au moins 8 caractères'
    }
    if (!/[A-Z]/.test(password)) {
      return 'Le mot de passe doit contenir au moins une lettre majuscule'
    }
    if (!/[a-z]/.test(password)) {
      return 'Le mot de passe doit contenir au moins une lettre minuscule'
    }
    if (!/[0-9]/.test(password)) {
      return 'Le mot de passe doit contenir au moins un chiffre'
    }
    return null
  }

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!validateEmail(formData.email)) {
      toast.error('Veuillez entrer une adresse email valide')
      return
    }

    if (state === 'Sign Up') {
      const passwordError = validatePassword(formData.password)
      if (passwordError) {
        toast.error(passwordError)
        return
      }

      if (!formData.firstname.trim() || !formData.lastname.trim()) {
        toast.error('Veuillez remplir tous les champs')
        return
      }
    }
    
    setLoading(true)
    
    try {
      axios.defaults.withCredentials = true
      
      if (state === 'Sign Up') {
        const response = await axios.post('http://localhost:4000/api/auth/register', {
          firstname: formData.firstname.trim(),
          lastname: formData.lastname.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          academicGrade: formData.academicGrade,
          institution: formData.institution
        })
        
        if (response.data.success) {
          toast.success('Compte créé avec succès! Vérifiez votre email pour le code OTP.')
          localStorage.setItem('userEmail', formData.email.toLowerCase().trim())
          setTimeout(() => {
            navigate('/email-verify')
          }, 1500)
        } else {
          toast.error(response.data.message)
        }
      } else {
        const response = await axios.post('http://localhost:4000/api/auth/login', {
          email: formData.email.toLowerCase().trim(),
          password: formData.password
        })
        
        if (response.data.success) {
          localStorage.setItem('token', response.data.token)
          toast.success('Connexion réussie!')
          setTimeout(() => {
            navigate('/')
          }, 1000)
        } else {
          toast.error(response.data.message)
        }
      }
    } catch (error) {
      console.error('Auth error:', error)
      toast.error(error.response?.data?.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const switchState = () => {
    setState(state === 'Sign Up' ? 'Login' : 'Sign Up')
    setFormData({
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      academicGrade: 'DOCTORANT',
      institution: 'UNIVERSITE_TLEMCEN_ABOU_BAKR_BELKAID'
    })
    setShowPassword(false)
  }

  return (
    <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 via-purple-300 to-pink-200'>
      <img 
        onClick={() => navigate('/')} 
        src={assets.logo} 
        alt="Logo" 
        className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer hover:scale-105 transition-transform' 
      />
      
      <div className='bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300'>
        <h2 className='text-3xl font-semibold text-white text-center mb-3'> 
          {state === 'Sign Up' ? 'Créer un compte' : 'Connexion'}
        </h2>
        <p className='text-center text-sm mb-6'>
          {state === 'Sign Up' ? 'Créez votre compte' : 'Bienvenue!'}
        </p>
        
        <form onSubmit={onSubmitHandler} className='space-y-4'>
          {state === 'Sign Up' && (
            <>
              <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
                <img src={assets.person_icon} alt="" />
                <input 
                  className='bg-transparent outline-none text-white w-full' 
                  type="text" 
                  name="firstname"
                  placeholder="Prénom" 
                  value={formData.firstname}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
                <img src={assets.person_icon} alt="" />
                <input 
                  className='bg-transparent outline-none text-white w-full' 
                  type="text" 
                  name="lastname"
                  placeholder="Nom" 
                  value={formData.lastname}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className='mb-4'>
                <select 
                  name="academicGrade"
                  value={formData.academicGrade}
                  onChange={handleChange}
                  className='w-full px-5 py-2.5 rounded-full bg-[#333A5C] text-white outline-none'
                  required
                  disabled={loading}
                >
                  {academicGrades.map(grade => (
                    <option key={grade.value} value={grade.value}>
                      {grade.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className='mb-4'>
                <select 
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  className='w-full px-5 py-2.5 rounded-full bg-[#333A5C] text-white outline-none'
                  required
                  disabled={loading}
                >
                  {institutions.map(inst => (
                    <option key={inst.value} value={inst.value}>
                      {inst.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          
          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.mail_icon} alt="" />
            <input 
              className='bg-transparent outline-none text-white w-full' 
              type="email" 
              name="email"
              placeholder="Email" 
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.lock_icon} alt="" />
            <input 
              className='bg-transparent outline-none text-white w-full' 
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Mot de passe" 
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className='text-gray-400 hover:text-white transition-colors'
              disabled={loading}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {state === 'Sign Up' && (
            <div className='text-xs text-gray-400 px-2'>
              <p>Le mot de passe doit contenir:</p>
              <ul className='list-disc list-inside space-y-1 mt-1'>
                <li className={formData.password.length >= 8 ? 'text-green-400' : ''}>
                  Au moins 8 caractères
                </li>
                <li className={/[A-Z]/.test(formData.password) ? 'text-green-400' : ''}>
                  Une lettre majuscule
                </li>
                <li className={/[a-z]/.test(formData.password) ? 'text-green-400' : ''}>
                  Une lettre minuscule
                </li>
                <li className={/[0-9]/.test(formData.password) ? 'text-green-400' : ''}>
                  Un chiffre
                </li>
              </ul>
            </div>
          )}

          {state === 'Login' && (
            <p 
              onClick={() => !loading && navigate('/reset-password')}
              className='text-indigo-500 my-4 cursor-pointer hover:underline'
            >
              Mot de passe oublié?
            </p>
          )}

          <button 
            type="submit"
            disabled={loading}
            className='w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium hover:from-indigo-600 hover:to-indigo-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Chargement...</span>
              </>
            ) : (
              <span>{state === 'Sign Up' ? "S'inscrire" : 'Se connecter'}</span>
            )}
          </button>
        </form>

        {state === 'Sign Up' ? (
          <p className='text-gray-400 text-center text-xs mt-4'>
            Vous avez déjà un compte?{' '}
            <span onClick={switchState} className='text-blue-400 cursor-pointer underline'>
              Connectez-vous ici
            </span>
          </p>
        ) : (
          <p className='text-gray-400 text-center text-xs mt-4'>
            Vous n'avez pas de compte?{' '}
            <span onClick={switchState} className='text-blue-400 cursor-pointer underline'>
              Inscrivez-vous
            </span>
          </p>
        )}
      </div>      
    </div>
  )
}

export default Login