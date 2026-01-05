import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types representing our blockchain state
export type EventStatus = 'Active' | 'Reported' | 'Disputed' | 'Finalized' | 'DAO_Vote';

export interface OracleEvent {
  id: string;
  question: string;
  category: 'Crypto' | 'Sports' | 'News' | 'Tech';
  bond: number;
  outcomes?: [string, string];
  source?: string;
  resolutionTime?: number;
  createdAt: number;
  statusUpdatedAt?: number;
  status: EventStatus;
  outcome?: string; // The reported outcome
  challengeCount: number;
  totalStaked: number; // For DAO votes
  votesFor: number;
  votesAgainst: number;
  creator: string;
}

export interface UserState {
  address: string | null;
  hnchBalance: number;
  stakedBalance: number;
  delegatedTo: string | null;
  pendingRewards: number;
}

interface BlockchainState {
  user: UserState;
  events: OracleEvent[];
  protocolRevenue: number;
  isLoading: boolean;

  // Actions
  setAddress: (address: string | null) => void;
  connectWallet: () => void;
  disconnectWallet: () => void;
  faucet: () => void;
  stake: (amount: number) => void;
  unstake: (amount: number) => void;
  delegate: (address: string) => void;
  claimRewards: () => void;

  createEvent: (question: string, bond: number, category: OracleEvent['category'], outcomes: [string, string], source: string, resolutionTime: number) => void;
  reportOutcome: (eventId: string, outcome: string) => void;
  challengeOutcome: (eventId: string) => void;
  finalizeEvent: (eventId: string) => void;
  vote: (eventId: string, support: boolean, amount: number) => void;
}

// Initial Mock Data
const INITIAL_EVENTS: OracleEvent[] = [
  {
    id: '1',
    question: 'Will TON hit $10 by Dec 31, 2025?',
    category: 'Crypto',
    bond: 10000,
    createdAt: Date.now() - 10000000,
    status: 'Active',
    challengeCount: 0,
    totalStaked: 0,
    votesFor: 0,
    votesAgainst: 0,
    creator: 'EQD...Test1'
  },
  {
    id: '2',
    question: 'Did STON.fi TVL exceed $500M in Q3?',
    category: 'Tech',
    bond: 20000,
    createdAt: Date.now() - 5000000,
    statusUpdatedAt: Date.now() - 1000000, // 1000s ago
    status: 'Reported',
    outcome: 'Yes',
    challengeCount: 0,
    totalStaked: 0,
    votesFor: 0,
    votesAgainst: 0,
    creator: 'EQD...Test2'
  },
  {
    id: '3',
    question: 'Who won the 2025 Telegram Gaming Championship?',
    category: 'Sports',
    bond: 80000,
    createdAt: Date.now() - 2000000,
    statusUpdatedAt: Date.now() - 500000,
    status: 'DAO_Vote', // Escalated!
    outcome: 'Team Notcoin',
    challengeCount: 3,
    totalStaked: 500000,
    votesFor: 150000,
    votesAgainst: 120000,
    creator: 'EQD...Test3'
  }
];

export const useBlockchainStore = create<BlockchainState>()(
  persist(
    (set, get) => ({
      user: {
        address: null,
        hnchBalance: 0,
        stakedBalance: 0,
        delegatedTo: null,
        pendingRewards: 0,
      },
      events: INITIAL_EVENTS,
      protocolRevenue: 1250000, // Mock initial revenue
      isLoading: false,

      setAddress: (address) => {
        set((state) => ({
          user: { ...state.user, address }
        }));
      },

      connectWallet: () => {
        set({ isLoading: true });
        setTimeout(() => {
          set((state) => ({
            isLoading: false,
            user: { ...state.user, address: 'EQC...DemoUser', hnchBalance: 1000 } // Start with a little balance or 0
          }));
        }, 800);
      },

      disconnectWallet: () => {
        set({ 
          user: { 
            address: null, 
            hnchBalance: 0, 
            stakedBalance: 0, 
            delegatedTo: null, 
            pendingRewards: 0 
          } 
        });
      },

      faucet: () => {
        set({ isLoading: true });
        setTimeout(() => {
          set((state) => ({
            isLoading: false,
            user: { ...state.user, hnchBalance: state.user.hnchBalance + 50000 }
          }));
        }, 1000);
      },

      stake: (amount) => {
        const { user } = get();
        if (user.hnchBalance < amount) return;
        set({ isLoading: true });
        setTimeout(() => {
          set((state) => ({
            isLoading: false,
            user: {
              ...state.user,
              hnchBalance: state.user.hnchBalance - amount,
              stakedBalance: state.user.stakedBalance + amount
            }
          }));
        }, 1500);
      },

      unstake: (amount) => {
        const { user } = get();
        if (user.stakedBalance < amount) return;
        set({ isLoading: true });
        setTimeout(() => {
          set((state) => ({
            isLoading: false,
            user: {
              ...state.user,
              stakedBalance: state.user.stakedBalance - amount,
              hnchBalance: state.user.hnchBalance + amount
            }
          }));
        }, 1500);
      },

      delegate: (address) => {
        set({ isLoading: true });
        setTimeout(() => {
          set((state) => ({
            isLoading: false,
            user: { ...state.user, delegatedTo: address }
          }));
        }, 1000);
      },

      claimRewards: () => {
        set({ isLoading: true });
        setTimeout(() => {
          set((state) => ({
            isLoading: false,
            user: { 
              ...state.user, 
              hnchBalance: state.user.hnchBalance + state.user.pendingRewards,
              pendingRewards: 0 
            }
          }));
        }, 1000);
      },

      createEvent: (question, bond, category, outcomes, source, resolutionTime) => {
        const { user } = get();
        if (user.hnchBalance < bond) return;
        
        set({ isLoading: true });
        setTimeout(() => {
          const newEvent: OracleEvent = {
            id: Math.random().toString(36).substr(2, 9),
            question,
            category,
            bond,
            outcomes,
            source,
            resolutionTime,
            createdAt: Date.now(),
            status: 'Active',
            challengeCount: 0,
            totalStaked: 0,
            votesFor: 0,
            votesAgainst: 0,
            creator: user.address || 'EQC...Anon'
          };
          
                set((state) => ({
                  isLoading: false,
                  user: { ...state.user, hnchBalance: state.user.hnchBalance - bond },
                  protocolRevenue: state.protocolRevenue + 500, // 500 HNCH creation fee
                  events: [newEvent, ...state.events]
                }));        }, 2000);
      },

      reportOutcome: (eventId, outcome) => {
        set({ isLoading: true });
        setTimeout(() => {
          set((state) => ({
            isLoading: false,
                    events: state.events.map(e => 
                      e.id === eventId 
                        ? { ...e, status: 'Reported', outcome, statusUpdatedAt: Date.now() } 
                        : e
                    )
                  }));        }, 1500);
      },

      challengeOutcome: (eventId) => {
        set({ isLoading: true });
        setTimeout(() => {
          set((state) => ({
            isLoading: false,
            events: state.events.map(e => {
              if (e.id !== eventId) return e;
              
              // Logic: 2x bond escalation. If count >= 2 (becoming 3), move to DAO Vote
              const newCount = e.challengeCount + 1;
              const newStatus = newCount >= 3 ? 'DAO_Vote' : 'Disputed';
              
                        return {
                          ...e,
                          challengeCount: newCount,
                          status: newStatus,
                          statusUpdatedAt: Date.now(),
                          bond: e.bond * 2
                        };            })
          }));
        }, 1500);
      },

      finalizeEvent: (eventId) => {
    set({ isLoading: true });
    setTimeout(() => {
      set((state) => {
        const reward = 1500; // Mock reward for finalizing
        return {
          isLoading: false,
          protocolRevenue: state.protocolRevenue - reward,
          user: { ...state.user, pendingRewards: state.user.pendingRewards + reward },
          events: state.events.map(e => {
            if (e.id !== eventId) return e;
            return {
              ...e,
              status: 'Finalized',
              statusUpdatedAt: Date.now()
            };
          })
        };
      });
    }, 1500);
  },

  vote: (eventId, support, amount) => {
        set({ isLoading: true });
        setTimeout(() => {
          set((state) => ({
            isLoading: false,
            events: state.events.map(e => {
              if (e.id !== eventId) return e;
              return {
                ...e,
                votesFor: support ? e.votesFor + Math.sqrt(amount) : e.votesFor, // Quadratic!
                votesAgainst: !support ? e.votesAgainst + Math.sqrt(amount) : e.votesAgainst,
                totalStaked: e.totalStaked + amount
              };
            })
          }));
        }, 1500);
      }
    }),
    {
      name: 'hunch-storage',
    }
  )
);
