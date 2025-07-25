import streamlit as st

def main():
    """
    Main function to run the Sentence Repeater Streamlit application
    """
    # Set page configuration
    st.set_page_config(
        page_title="Sentence Repeater",
        page_icon="🔄",
        layout="centered"
    )
    
    # Application title and description
    st.title("🔄 Sentence Repeater")
    st.write("Enter a sentence and specify how many times you want it repeated!")
    
    # Create input form
    with st.form("sentence_form"):
        # Text input for the sentence
        sentence = st.text_input(
            "Enter your sentence:",
            placeholder="Type your sentence here...",
            help="Enter any sentence you want to repeat"
        )
        
        # Number input for repetition count
        repeat_count = st.number_input(
            "Number of repetitions:",
            min_value=1,
            max_value=100,
            value=3,
            step=1,
            help="Choose how many times to repeat the sentence (1-100)"
        )
        
        # Submit button
        submitted = st.form_submit_button("Repeat Sentence")
    
    # Process the form submission
    if submitted:
        # Input validation
        if not sentence or sentence.strip() == "":
            st.error("⚠️ Please enter a sentence to repeat!")
            return
        
        if repeat_count < 1:
            st.error("⚠️ Number of repetitions must be at least 1!")
            return
        
        if repeat_count > 100:
            st.error("⚠️ Number of repetitions cannot exceed 100!")
            return
        
        # Clean the input sentence
        clean_sentence = sentence.strip()
        
        # Display success message
        st.success(f"✅ Repeating '{clean_sentence}' {repeat_count} time(s):")
        
        # Create and display the repeated sentence
        try:
            # Generate repeated sentences
            repeated_sentences = []
            for i in range(repeat_count):
                repeated_sentences.append(f"{i+1}. {clean_sentence}")
            
            # Display the output in a styled container
            st.subheader("Output:")
            
            # Show the repeated sentences in a text area for easy copying
            output_text = "\n".join(repeated_sentences)
            st.text_area(
                "Repeated sentences:",
                value=output_text,
                height=min(300, 50 + (repeat_count * 25)),  # Dynamic height based on content
                help="You can select and copy this text"
            )
            
            # Additional info
            st.info(f"📊 Total characters: {len(output_text)} | Total lines: {repeat_count}")
            
        except Exception as e:
            st.error(f"❌ An error occurred while processing your request: {str(e)}")
    
    # Add some spacing and footer information
    st.markdown("---")
    st.markdown(
        """
        <div style='text-align: center; color: #666; font-size: 0.8em;'>
            Simple sentence repeater tool built with Streamlit
        </div>
        """, 
        unsafe_allow_html=True
    )

# Additional features section
def show_examples():
    """
    Show example usage in the sidebar
    """
    with st.sidebar:
        st.header("📖 Examples")
        st.write("Here are some example sentences you can try:")
        
        examples = [
            "Hello, World!",
            "Practice makes perfect.",
            "The quick brown fox jumps over the lazy dog.",
            "Python is awesome!",
            "Learning is fun."
        ]
        
        for example in examples:
            if st.button(f"Use: '{example}'", key=f"example_{example}"):
                # Note: In a more complex app, we could use session state to populate the form
                st.info(f"💡 Copy this example: {example}")
        
        st.markdown("---")
        st.header("ℹ️ Tips")
        st.write("""
        - Keep sentences reasonable in length
        - Maximum 100 repetitions allowed
        - Output can be copied from the text area
        - Use punctuation for better readability
        """)

if __name__ == "__main__":
    # Show examples in sidebar
    show_examples()
    
    # Run main application
    main()