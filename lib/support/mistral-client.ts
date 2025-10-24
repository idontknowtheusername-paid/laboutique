import { MistralResponse, SupportConfig } from '@/types/support';

export class MistralClient {
  private apiKey: string;
  private baseUrl = 'https://api.mistral.ai/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(
    message: string,
    conversationHistory: string[],
    context?: string
  ): Promise<MistralResponse> {
    try {
      const systemPrompt = `Tu es l'assistant virtuel de JomionStore, un centre commercial digital au Bénin. 
      
Règles importantes:
- Réponds toujours en français
- Sois professionnel et amical
- Aide avec les questions sur les produits, commandes, livraisons, paiements
- Si tu ne peux pas aider ou si la question est complexe, indique que tu vas créer un ticket pour un agent humain
- Garde tes réponses concises mais utiles
- Utilise le contexte: ${context || 'Boutique en ligne JomionStore'}

Historique de la conversation:
${conversationHistory.join('\n')}

Question actuelle: ${message}`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral-small-latest',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: message
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`Mistral API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || 'Désolé, je ne peux pas traiter votre demande pour le moment.';

      // Déterminer si on doit escalader
      const shouldEscalate = this.shouldEscalateToHuman(message, content);
      const confidence = this.calculateConfidence(content);

      return {
        content,
        shouldEscalate,
        confidence
      };
    } catch (error) {
      console.error('Erreur Mistral API:', error);
      return {
        content: 'Désolé, je rencontre un problème technique. Un agent humain va vous aider.',
        shouldEscalate: true,
        confidence: 0
      };
    }
  }

  private shouldEscalateToHuman(message: string, response: string): boolean {
    const escalationKeywords = [
      'remboursement', 'plainte', 'problème', 'erreur', 'bug', 'ne fonctionne pas',
      'livraison', 'commande', 'paiement', 'compte', 'mot de passe', 'urgent',
      'insatisfait', 'déçu', 'mauvais', 'cassé', 'défectueux'
    ];

    const messageLower = message.toLowerCase();
    const responseLower = response.toLowerCase();

    // Escalader si le message contient des mots-clés d'escalade
    if (escalationKeywords.some(keyword => messageLower.includes(keyword))) {
      return true;
    }

    // Escalader si la réponse indique qu'on ne peut pas aider
    if (responseLower.includes('agent humain') || 
        responseLower.includes('créer un ticket') ||
        responseLower.includes('ne peux pas aider')) {
      return true;
    }

    return false;
  }

  private calculateConfidence(response: string): number {
    // Calcul simple de confiance basé sur la longueur et la structure de la réponse
    const responseLength = response.length;
    const hasQuestionMarks = (response.match(/\?/g) || []).length;
    const hasUncertaintyWords = (response.match(/peut-être|probablement|je pense|je crois/g) || []).length;
    
    let confidence = 0.8; // Base confidence
    
    if (responseLength < 50) confidence -= 0.2;
    if (hasQuestionMarks > 2) confidence -= 0.1;
    if (hasUncertaintyWords > 0) confidence -= 0.1;
    
    return Math.max(0, Math.min(1, confidence));
  }
}