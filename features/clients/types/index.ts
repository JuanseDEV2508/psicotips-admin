export type ClientStatus = "ACTIVE" | "INACTIVE" | "LEAD";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type ConversationStatus = "NEW" | "IN_CONVERSATION" | "INFORMATION_PENDING" | "READY_FOR_REQUIREMENT" | "REQUIREMENT_REVIEW" | "READY_FOR_PROPOSAL" | "PROPOSAL_DRAFT" | "PROPOSAL_REVIEW" | "PROPOSAL_SENT" | "WON" | "LOST" | "CLOSED";
export type ProposalStatus = "DRAFT" | "IN_REVIEW" | "APPROVED" | "SENT" | "VIEWED" | "ACCEPTED" | "REJECTED" | "EXPIRED";

export interface Agent { id: number; name: string; email: string }
export interface ClientCompany { id: number; name: string; nit: string | null; email: string | null; phone: string | null; city: string | null; address: string | null; sector: string | null; numberOfParticipants: number | null; howTheyFoundUs: string | null; isActive: boolean }
export interface ClientContact { id: number; name: string; firstName: string; lastName: string; email: string | null; phone: string; whatsappId: string | null; jobTitle: string | null; createdAt: string }
export interface ClientConversationSummary { id: number; status: ConversationStatus; priority: Priority; controlMode: "BOT" | "HUMAN" | "HYBRID" | "PAUSED"; assignedAgent: Agent | null; messagesCount: number; hasRequirement: boolean; hasProposal: boolean; lastMessageAt: string | null; createdAt: string }
export interface ClientProposalSummary { id: number; title: string; normalizedStatus: ProposalStatus; total: number | null; confidenceScore: number | null; aiGenerated: boolean; assignedAgent: Agent | null; createdAt: string; updatedAt: string; sentAt: string | null }
export interface ClientActivity { id: string; type: "CLIENT_CREATED" | "CONVERSATION_CREATED" | "AGENT_ASSIGNED" | "CLIENT_UPDATED" | "REQUIREMENT_CREATED" | "PROPOSAL_GENERATED" | "PROPOSAL_SENT" | "PROPOSAL_ACCEPTED" | "INTERNAL_NOTE"; title: string; description: string; actor: string | null; createdAt: string }
export interface Client { id: number; status: ClientStatus; contact: ClientContact; company: ClientCompany | null; conversations: ClientConversationSummary[]; proposals: ClientProposalSummary[]; activity: ClientActivity[]; commercialStatus: string; priority: Priority; assignedAgent: Agent | null; nextActionAt: string | null; lastActivityAt: string; notes: string | null }
export interface PaginatedResponse<T> { count: number; next: string | null; previous: string | null; results: T[] }
export interface CompanyListItem { id: number; name: string; email: string | null; phone: string | null; nit: string | null; city: string | null; numberOfParticipants: number | null; description: string | null; address: string | null; howTheyFoundUs: string | null; isActive: boolean; proposalDate: string | null; createdAt: string }
export interface ClientStats { totalClients: number; activeClients: number; openConversations: number; proposalsSent: number }
export interface ClientListParams { search?: string; status?: ClientStatus; city?: string; activity?: "OPEN_CONVERSATION" | "WITH_PROPOSAL" | "WITHOUT_PROPOSAL"; page?: number; pageSize?: number }
export interface ClientsRepository { getClients(params?: Pick<ClientListParams, "page" | "pageSize">): Promise<PaginatedResponse<CompanyListItem>>; getClientStats(): Promise<ClientStats>; getClientById(id: number): Promise<Client | null> }
