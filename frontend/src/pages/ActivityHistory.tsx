// @ts-nocheck
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import {
    Book, MessageSquare, Sparkles, ArrowLeft,
    ChevronRight, Calendar, Clock
} from 'lucide-react'
import { useActivityHistory } from '../hooks/use-activity'
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
            className="glass-panel p-6 rounded-[20px] flex items-center gap-6 cursor-pointer transition-all duration-300 ease-in-out border border-[var(--border-color)] mb-4 bg-[var(--bg-card)]"
        >
            <div className="w-12 h-12 rounded-xl bg-[var(--bg-alt)] flex items-center justify-center text-[var(--brand-accent)]">
                {getIcon()}
            </div>
            <div className="flex-1">
                <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                    {activity.subtitle?.toUpperCase() || ''}
                </p>
                <h4 style={{ margin: '0.2rem 0', fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 600 }}>
                    {activity.title}
                </h4>
                <div className="flex gap-4 items-center">
                    <span className="flex items-center gap-[0.3rem] text-xs text-[var(--text-muted)]">
                        <Clock size={12} /> {getRelativeTime(activity.created_at)}
                    </span>
                    <span className="flex items-center gap-[0.3rem] text-xs text-[var(--text-muted)]">
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

export const ActivityHistory = () => {
    const navigate = useNavigate()
    const { data: activities = [], isLoading: loading } = useActivityHistory(50)

    const renderContent = () => {
        if (loading) {
            return (
                <div className="text-center p-16">
                    <div className="loading-spinner"></div>
                    <p className="mt-4 text-[var(--text-muted)]">Gathering your milestones...</p>
                </div>
            )
        }

        if (activities.length > 0) {
            return (
                <div className="grid gap-4">
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
            <div className="text-center bg-[var(--bg-card)] rounded-[32px] border border-[var(--border-color)]" style={{ padding: '5rem' }}>
                <Sparkles size={48} color="var(--brand-accent)" style={{ opacity: 0.3, marginBottom: '1.5rem' }} />
                <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>A New Path Awaits</h3>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 2rem' }}>
                    You haven't recorded any spiritual activities yet. Start a conversation or begin a study to see your journey unfold.
                </p>
                <button
                    onClick={() => navigate('/app/ai-chat')}
                    className="bg-[var(--brand-solid)] text-[var(--bg-main)] border-0 rounded-xl font-semibold cursor-pointer"
                    style={{ padding: '1rem 2rem' }}
                >
                    START YOUR FIRST SESSION
                </button>
            </div>
        )
    }

    return (
        <div className="home-container pt-16">
            <div className="flex items-center gap-4 mb-12">
                <button
                    onClick={() => navigate(-1)}
                    className="bg-[var(--bg-alt)] border-0 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
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
