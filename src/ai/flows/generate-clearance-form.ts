'use server';
/**
 * @fileOverview Generates a personalized clearance form for students.
 *
 * - generateClearanceForm - A function that generates a personalized clearance form.
 * - GenerateClearanceFormInput - The input type for the generateClearanceForm function.
 * - GenerateClearanceFormOutput - The return type for the generateClearanceForm function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateClearanceFormInputSchema = z.object({
  studentName: z.string().describe('The name of the student.'),
  studentId: z.string().describe('The ID of the student.'),
  hallOfResidence: z.string().describe('The hall of residence of the student.'),
});
export type GenerateClearanceFormInput = z.infer<typeof GenerateClearanceFormInputSchema>;

const GenerateClearanceFormOutputSchema = z.object({
  clearanceForm: z.string().describe('The generated clearance form in markdown format.'),
});
export type GenerateClearanceFormOutput = z.infer<typeof GenerateClearanceFormOutputSchema>;

export async function generateClearanceForm(input: GenerateClearanceFormInput): Promise<GenerateClearanceFormOutput> {
  return generateClearanceFormFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateClearanceFormPrompt',
  input: {schema: GenerateClearanceFormInputSchema},
  output: {schema: GenerateClearanceFormOutputSchema},
  prompt: `You are an AI assistant designed to generate personalized clearance forms for students at African Leadership Academy.

  Generate a markdown formatted clearance form for the following student:

  Student Name: {{{studentName}}}
  Student ID: {{{studentId}}}
  Hall of Residence: {{{hallOfResidence}}}

  Include the following common clearance items:

  - Textbooks (list specific textbooks if possible, otherwise, list subject areas e.g. Physics, Chemistry)
  - Library Books
  - Sports Equipment
  - Dormitory Keys
  - School ID
  - Laptop (if applicable)

  The form should include a table with columns for:
  - Item Description
  - Status (e.g., Cleared, Pending)
  - Notes

  Ensure the form is professional and easy to understand.
  `,
});

const generateClearanceFormFlow = ai.defineFlow(
  {
    name: 'generateClearanceFormFlow',
    inputSchema: GenerateClearanceFormInputSchema,
    outputSchema: GenerateClearanceFormOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
