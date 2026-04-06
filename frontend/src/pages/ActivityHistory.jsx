import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import {
    Book, MessageSquare, Sparkles, ArrowLeft,
    ChevronRight, Calendar, Clock
} from 'lucide-react'
import { homeService } from '../services/api'
import './Home.css'

const ActivityRow = ({ activity, onClick }) => {
    const getRelativeTime = (dateStr) => {
        const now = new Date()
        const past = new Date(dateStr)
        const diffMs = now - past
        const diffHrs = Math.round(diffMs / (1000 * 60 * 60))
        if (diffHrs < 1) return 'JUST NOW'
        if (diffHrs < 24) return `${diffHrs}H AGO`
        return `${Math.round(diffHrs / 24)}D AGO`
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClick()
        }
    }

    const getIcon = () => {
        switch (activity.type) {
            case 'bible_study': return <Book size={20} />
            case 'support': return <MessageSquare size={20} />
            case 'chat': return <Sparkles size={20} />
            default: return <Sparkles size={20} />
        }
    }

    return (
        <div
            onClick={onClick}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            className="glass-panel"
            style={{
                padding: '1.5rem',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '1px solid var(--border-color)',
                marginBottom: '1rem',
                background: 'var(--bg-card)'
            }}
        >
            <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'var(--bg-alt)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-accent)'
            }}>
                {getIcon()}
            </div>
            <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                    {activity.subtitle?.toUpperCase() || ''}
                </p>
                <h4 style={{ margin: '0.2rem 0', fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 600 }}>
                    {activity.title}
                </h4>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <Clock size={12} /> {getRelativeTime(activity.created_at)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <Calendar size={12} /> {new Date(activity.created_at).toLocaleDateString()}
                    </span>
                </div>
            </div>
            <ChevronRight size={18} color="var(--text-muted)" />
        </div>
    )
}

ActivityRow.propTypes = {
    activity: PropTypes.shape({
        type: PropTypes.string,
        title: PropTypes.string,
        subtitle: PropTypes.string,
        created_at: PropTypes.string,
        path: PropTypes.string,
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    }).isRequired,
    onClick: PropTypes.func.isRequired
}

const ActivityHistory = () => {
    const navigate = useNavigate()
    const [activities, setActivities] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchFullActivity = async () => {
            try {
                const data = await homeService.getActivity(50) // Request more for history page
                if (data.activity) setActivities(data.activity)
            } catch (err) {
                console.error('Failed to fetch activities', err)
            } finally {
                setLoading(false)
            }
        }
        fetchFullActivity()
    }, [])

    const renderContent = () => {
        if (loading) {
            return (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <div className="loading-spinner"></div>
                    <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Gathering your milestones...</p>
                </div>
            )
        }

        if (activities.length > 0) {
            return (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {activities.map((activity, idx) => (
                        <ActivityRow
                            key={activity.id || idx}
                            activity={activity}
                            onClick={() => navigate(activity.path)}
                        />
                    ))}
                </div>
            )
        }

        return (
            <div style={{ textAlign: 'center', padding: '5rem', background: 'var(--bg-card)', borderRadius: '32px', border: '1px solid var(--border-color)' }}>
                <Sparkles size={48} color="var(--brand-accent)" style={{ opacity: 0.3, marginBottom: '1.5rem' }} />
                <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>A New Path Awaits</h3>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 2rem' }}>
                    You haven't recorded any spiritual activities yet. Start a conversation or begin a study to see your journey unfold.
                </p>
                <button
                    onClick={() => navigate('/app/ai-chat')}
                    style={{ background: 'var(--brand-solid)', color: 'var(--bg-main)', border: 'none', padding: '1rem 2rem', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}
                >
                    START YOUR FIRST SESSION
                </button>
            </div>
        )
    }

    return (
        <div className="home-container" style={{ paddingTop: '4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{ background: 'var(--bg-alt)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                    <ArrowLeft size={20} color="var(--text-main)" />
                </button>
                <h1 className="home-title" style={{ fontSize: '2.5rem', margin: 0 }}>Spiritual Journey</h1>
            </div>

            <div style={{ maxWidth: '800px' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '1.1rem', lineHeight: 1.6 }}>
                    Every conversation, every study, and every prayer is a milestone in your walk with faith. Review your past moments of presence and reflection here.
                </p>

                {renderContent()}
            </div>
        </div>
    )
}

export default ActivityHistory
