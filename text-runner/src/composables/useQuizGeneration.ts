
export function useQuizGeneration() {
  const generateQuizOptions = (correctWord: string): string[] => {
    // Simple fallback options - later replace with Datamuse API
    const commonWords = [
      'the', 'and', 'is', 'of', 'in', 'to', 'has', 'was', 'for', 'are',
      'with', 'his', 'they', 'at', 'be', 'this', 'have', 'from', 'or',
      'one', 'had', 'by', 'word', 'but', 'not', 'what', 'all', 'were',
      'first', 'also', 'after', 'back', 'other', 'many', 'than', 'then',
      'them', 'these', 'so', 'some', 'her', 'would', 'make', 'like',
      'into', 'him', 'time', 'two', 'more', 'very', 'when', 'come',
      'its', 'now', 'over', 'think', 'also', 'your', 'work', 'life',
      'only', 'can', 'still', 'should', 'after', 'being', 'now', 'made',
      'before', 'here', 'through', 'when', 'where', 'much', 'take',
      'well', 'little', 'good', 'woman', 'old', 'see', 'get', 'may',
      'new', 'write', 'our', 'out', 'day', 'go', 'use', 'no', 'man',
      'find', 'right', 'too', 'any', 'each', 'most', 'she', 'do', 'how'
    ]

    // Filter out the correct word and pick 3 random alternatives
    const alternatives = commonWords
      .filter(word => word.toLowerCase() !== correctWord.toLowerCase())
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)

    // Combine correct answer with alternatives and shuffle
    const allOptions = [correctWord, ...alternatives]
    return allOptions.sort(() => Math.random() - 0.5)
  }

  return {
    generateQuizOptions
  }
}
